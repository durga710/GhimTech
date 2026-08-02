"use client";
/**
 * Return workspace: intake, calculation with traces, diagnostics, lifecycle
 * actions, signature, and e-filing — the preparer's (and client's) single
 * view of a return.
 */
import { use, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Money,
  Select,
  SeverityBadge,
  Skeleton,
  StatusBadge,
  cx,
} from "@ghimtech/ui";
import { api, apiUrl, getToken, getUser } from "@/lib/api";
import { useApi } from "@/lib/use-api";

interface W2 {
  id: string;
  employerName: string;
  wages: number;
  federalWithholding: number;
  socialSecurityWages: number;
  medicareWages: number;
  stateWages: number;
  stateWithholding: number;
  stateCode?: string;
  localWithholding: number;
  belongsToSpouse: boolean;
}

interface ReturnModel {
  returnId: string;
  taxYear: number;
  filingStatus: string;
  w2s: W2[];
  dependents: unknown[];
  pennsylvania?: {
    residencyStatus: string;
    psdCode?: string;
    schoolDistrict?: string;
    claimTaxForgiveness: boolean;
    spEligibilityOtherIncome: number;
  };
  eitc: { claiming: boolean; disqualified: boolean };
  [key: string]: unknown;
}

interface ReturnDetail {
  id: string;
  clientId: string;
  taxYear: number;
  status: string;
  latestSnapshotHash?: string;
  allowedTransitions: string[];
  model: ReturnModel;
}

interface TraceEntry {
  lineId: string;
  label: string;
  valueDollars: number;
  formula: string;
  ruleVersion: string;
}

interface Calculation {
  snapshotHash: string;
  federal: {
    adjustedGrossIncome: number;
    taxableIncome: number;
    incomeTax: number;
    totalTax: number;
    totalPayments: number;
    earnedIncomeCredit: number;
    childTaxCredit: number;
    additionalChildTaxCredit: number;
    refund: number;
    balanceDue: number;
    trace: { entries: TraceEntry[] };
  };
  pennsylvania?: {
    totalTaxableIncome: number;
    taxLiability: number;
    taxForgiveness: number;
    totalPayments: number;
    refund: number;
    balanceDue: number;
    trace: { entries: TraceEntry[] };
  };
  diagnostics: Array<{ code: string; severity: string; message: string; jurisdiction: string }>;
}

interface Submission {
  id: string;
  providerSubmissionId: string;
  state: string;
  submittedAt: string;
  acknowledgment?: {
    accepted: boolean;
    agencyTrackingId?: string;
    rejections: Array<{
      code: string;
      message: string;
      explanation?: string;
      correctiveAction?: string;
    }>;
  };
}

const EDITABLE_STATUSES = new Set([
  "DRAFT",
  "INCOMPLETE",
  "READY_FOR_PREPARER_REVIEW",
  "PREPARER_REVIEWED",
  "READY_FOR_REVIEWER",
  "REVIEW_CHANGES_REQUESTED",
  "APPROVED",
  "AWAITING_CLIENT_REVIEW",
  "AWAITING_SIGNATURE",
  "VALIDATION_FAILED",
  "REJECTED",
  "CORRECTION_REQUIRED",
]);

const dollarsToCents = (value: string) => Math.round(Number(value || "0") * 100);
const centsToDollars = (cents: number) => (cents / 100).toFixed(2);

export default function ReturnWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const detail = useApi<ReturnDetail>(`/returns/${id}`);
  const submissions = useApi<Submission[]>(`/returns/${id}/submissions`);
  const user = getUser();

  const [model, setModel] = useState<ReturnModel>();
  const [calc, setCalc] = useState<Calculation>();
  const [notice, setNotice] = useState<{ tone: "success" | "danger" | "info"; text: string }>();
  const [busy, setBusy] = useState<string>();
  const [showTrace, setShowTrace] = useState(false);
  const [signatureText, setSignatureText] = useState("");

  useEffect(() => {
    if (detail.data) setModel(detail.data.model);
  }, [detail.data]);

  const status = detail.data?.status ?? "…";
  const editable =
    EDITABLE_STATUSES.has(status) && user?.role !== "AUDITOR" && user?.role !== "CLIENT";

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setNotice(undefined);
    try {
      await fn();
    } catch (err) {
      setNotice({ tone: "danger", text: (err as Error).message });
    } finally {
      setBusy(undefined);
    }
  }

  const saveModel = () =>
    run("save", async () => {
      await api(`/returns/${id}/model`, { method: "PUT", body: model });
      setNotice({ tone: "success", text: "Return data saved." });
      await detail.refetch();
    });

  const calculate = () =>
    run("calculate", async () => {
      const result = await api<Calculation>(`/returns/${id}/calculate`, { method: "POST" });
      setCalc(result);
      const blocking = result.diagnostics.filter((d) => d.severity === "ERROR").length;
      setNotice(
        blocking > 0
          ? { tone: "danger", text: `Calculated with ${blocking} blocking diagnostic(s).` }
          : { tone: "success", text: "Calculation complete — no blocking diagnostics." },
      );
      await detail.refetch();
    });

  const transition = (toStatus: string) =>
    run(toStatus, async () => {
      await api(`/returns/${id}/transition`, { method: "POST", body: { toStatus } });
      await detail.refetch();
    });

  const sign = () =>
    run("sign", async () => {
      await api(`/returns/${id}/signatures`, {
        method: "POST",
        body: {
          signatureText,
          consentAcknowledged: true,
          reviewedSnapshotHash: detail.data?.latestSnapshotHash,
        },
      });
      setNotice({ tone: "success", text: "Signature captured — the return is now locked." });
      await detail.refetch();
    });

  const efile = () =>
    run("efile", async () => {
      await api(`/returns/${id}/efile`, { method: "POST" });
      setNotice({ tone: "info", text: "Transmitted — awaiting agency acknowledgment." });
      await detail.refetch();
      await submissions.refetch();
    });

  const poll = () =>
    run("poll", async () => {
      const result = await api<{ status: string }>(`/returns/${id}/efile/poll`, { method: "POST" });
      setNotice({
        tone: "info",
        text: `Acknowledgment status: ${result.status.replaceAll("_", " ")}`,
      });
      await detail.refetch();
      await submissions.refetch();
    });

  if (detail.loading || !model) return <Skeleton className="h-64" />;
  if (detail.error) return <Alert tone="danger">{detail.error}</Alert>;
  const ret = detail.data!;

  function updateW2(index: number, patch: Partial<W2>) {
    setModel((m) => {
      if (!m) return m;
      const w2s = m.w2s.map((w, i) => (i === index ? { ...w, ...patch } : w));
      return { ...m, w2s };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            Tax year {ret.taxYear} return <StatusBadge status={status} />
          </h1>
          <p className="text-sm text-slate-500">
            Snapshot{" "}
            <span className="font-mono text-xs">
              {ret.latestSnapshotHash
                ? `${ret.latestSnapshotHash.slice(0, 12)}…`
                : "not calculated"}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {editable && (
            <>
              <Button variant="secondary" size="sm" onClick={saveModel} disabled={Boolean(busy)}>
                {busy === "save" ? "Saving…" : "Save"}
              </Button>
              <Button size="sm" onClick={calculate} disabled={Boolean(busy)}>
                {busy === "calculate" ? "Calculating…" : "Calculate"}
              </Button>
            </>
          )}
          {ret.allowedTransitions
            .filter((t) => t !== "SIGNED")
            .map((toStatus) => (
              <Button
                key={toStatus}
                variant="secondary"
                size="sm"
                onClick={() => transition(toStatus)}
                disabled={Boolean(busy)}
              >
                → {toStatus.replaceAll("_", " ")}
              </Button>
            ))}
          {(status === "READY_TO_EFILE" || status === "RESUBMISSION_READY") &&
            user?.role !== "CLIENT" && (
              <Button variant="success" size="sm" onClick={efile} disabled={Boolean(busy)}>
                {busy === "efile" ? "Transmitting…" : "Transmit e-file"}
              </Button>
            )}
          {(status === "ACKNOWLEDGMENT_PENDING" || status === "RESUBMITTED") && (
            <Button variant="secondary" size="sm" onClick={poll} disabled={Boolean(busy)}>
              {busy === "poll" ? "Checking…" : "Check acknowledgment"}
            </Button>
          )}
          <a
            href={`${apiUrl(`/returns/${id}/package?format=html`)}`}
            onClick={(e) => {
              e.preventDefault();
              void run("package", async () => {
                const response = await fetch(apiUrl(`/returns/${id}/package?format=html`), {
                  headers: { authorization: `Bearer ${getToken()}` },
                });
                if (!response.ok) throw new Error("Run calculations before opening the package");
                const html = await response.text();
                const win = window.open("", "_blank");
                win?.document.write(html);
                win?.document.close();
              });
            }}
            className="inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300"
          >
            View forms ↗
          </a>
        </div>
      </div>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

      <div className="grid gap-6 xl:grid-cols-5">
        {/* ---- Intake ---- */}
        <div className="space-y-6 xl:col-span-3">
          <Card>
            <CardHeader
              actions={
                editable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setModel((m) =>
                        m
                          ? {
                              ...m,
                              w2s: [
                                ...m.w2s,
                                {
                                  id: `w2-${m.w2s.length + 1}-${Date.now().toString(36)}`,
                                  employerName: "",
                                  wages: 0,
                                  federalWithholding: 0,
                                  socialSecurityWages: 0,
                                  medicareWages: 0,
                                  stateWages: 0,
                                  stateWithholding: 0,
                                  stateCode: "PA",
                                  localWithholding: 0,
                                  belongsToSpouse: false,
                                },
                              ],
                            }
                          : m,
                      )
                    }
                  >
                    + Add W-2
                  </Button>
                ) : undefined
              }
            >
              <CardTitle>Intake — income</CardTitle>
            </CardHeader>
            <CardBody className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Filing status">
                  {(fid) => (
                    <Select
                      id={fid}
                      disabled={!editable}
                      value={model.filingStatus}
                      onChange={(e) => setModel({ ...model, filingStatus: e.target.value })}
                    >
                      {[
                        "SINGLE",
                        "MARRIED_FILING_JOINTLY",
                        "MARRIED_FILING_SEPARATELY",
                        "HEAD_OF_HOUSEHOLD",
                        "QUALIFYING_SURVIVING_SPOUSE",
                      ].map((fs) => (
                        <option key={fs} value={fs}>
                          {fs.replaceAll("_", " ").toLowerCase()}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label="Claim EITC when eligible">
                  {(fid) => (
                    <Select
                      id={fid}
                      disabled={!editable}
                      value={model.eitc.claiming ? "yes" : "no"}
                      onChange={(e) =>
                        setModel({
                          ...model,
                          eitc: { ...model.eitc, claiming: e.target.value === "yes" },
                        })
                      }
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </Select>
                  )}
                </Field>
              </div>

              {model.w2s.length === 0 && (
                <p className="text-sm text-slate-500">No W-2s yet. Add one to begin.</p>
              )}
              {model.w2s.map((w2, index) => (
                <fieldset
                  key={w2.id}
                  className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                >
                  <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    W-2 #{index + 1}
                  </legend>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Field label="Employer">
                      {(fid) => (
                        <Input
                          id={fid}
                          disabled={!editable}
                          value={w2.employerName}
                          onChange={(e) => updateW2(index, { employerName: e.target.value })}
                        />
                      )}
                    </Field>
                    <Field label="Box 1 — wages">
                      {(fid) => (
                        <Input
                          id={fid}
                          type="number"
                          step="0.01"
                          disabled={!editable}
                          value={centsToDollars(w2.wages)}
                          onChange={(e) => {
                            const cents = dollarsToCents(e.target.value);
                            updateW2(index, {
                              wages: cents,
                              socialSecurityWages: cents,
                              medicareWages: cents,
                              stateWages: cents,
                            });
                          }}
                        />
                      )}
                    </Field>
                    <Field label="Box 2 — federal withholding">
                      {(fid) => (
                        <Input
                          id={fid}
                          type="number"
                          step="0.01"
                          disabled={!editable}
                          value={centsToDollars(w2.federalWithholding)}
                          onChange={(e) =>
                            updateW2(index, { federalWithholding: dollarsToCents(e.target.value) })
                          }
                        />
                      )}
                    </Field>
                    <Field label="Box 16 — PA wages">
                      {(fid) => (
                        <Input
                          id={fid}
                          type="number"
                          step="0.01"
                          disabled={!editable}
                          value={centsToDollars(w2.stateWages)}
                          onChange={(e) =>
                            updateW2(index, { stateWages: dollarsToCents(e.target.value) })
                          }
                        />
                      )}
                    </Field>
                    <Field label="Box 17 — PA withholding">
                      {(fid) => (
                        <Input
                          id={fid}
                          type="number"
                          step="0.01"
                          disabled={!editable}
                          value={centsToDollars(w2.stateWithholding)}
                          onChange={(e) =>
                            updateW2(index, { stateWithholding: dollarsToCents(e.target.value) })
                          }
                        />
                      )}
                    </Field>
                    <Field label="Belongs to">
                      {(fid) => (
                        <Select
                          id={fid}
                          disabled={!editable}
                          value={w2.belongsToSpouse ? "spouse" : "taxpayer"}
                          onChange={(e) =>
                            updateW2(index, { belongsToSpouse: e.target.value === "spouse" })
                          }
                        >
                          <option value="taxpayer">Taxpayer</option>
                          <option value="spouse">Spouse</option>
                        </Select>
                      )}
                    </Field>
                  </div>
                </fieldset>
              ))}

              {model.pennsylvania && (
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="PA residency">
                    {(fid) => (
                      <Select
                        id={fid}
                        disabled={!editable}
                        value={model.pennsylvania!.residencyStatus}
                        onChange={(e) =>
                          setModel({
                            ...model,
                            pennsylvania: {
                              ...model.pennsylvania!,
                              residencyStatus: e.target.value,
                            },
                          })
                        }
                      >
                        <option value="FULL_YEAR_RESIDENT">Full-year resident</option>
                        <option value="PART_YEAR_RESIDENT">Part-year (not yet filable)</option>
                        <option value="NONRESIDENT">Nonresident (not yet filable)</option>
                      </Select>
                    )}
                  </Field>
                  <Field label="PSD code" hint="6-digit local tax district code">
                    {(fid) => (
                      <Input
                        id={fid}
                        disabled={!editable}
                        value={model.pennsylvania!.psdCode ?? ""}
                        onChange={(e) =>
                          setModel({
                            ...model,
                            pennsylvania: {
                              ...model.pennsylvania!,
                              psdCode: e.target.value || undefined,
                            },
                          })
                        }
                      />
                    )}
                  </Field>
                  <Field label="Claim PA tax forgiveness">
                    {(fid) => (
                      <Select
                        id={fid}
                        disabled={!editable}
                        value={model.pennsylvania!.claimTaxForgiveness ? "yes" : "no"}
                        onChange={(e) =>
                          setModel({
                            ...model,
                            pennsylvania: {
                              ...model.pennsylvania!,
                              claimTaxForgiveness: e.target.value === "yes",
                            },
                          })
                        }
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes, if eligible</option>
                      </Select>
                    )}
                  </Field>
                </div>
              )}
            </CardBody>
          </Card>

          {/* ---- Diagnostics ---- */}
          {calc && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostics ({calc.diagnostics.length})</CardTitle>
              </CardHeader>
              <CardBody className="space-y-2">
                {calc.diagnostics.length === 0 && (
                  <p className="text-sm text-emerald-600">No diagnostics — the return is clean.</p>
                )}
                {calc.diagnostics.map((diag, i) => (
                  <div
                    key={`${diag.code}-${i}`}
                    className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-700"
                  >
                    <SeverityBadge severity={diag.severity} />
                    <div>
                      <p className="text-sm">{diag.message}</p>
                      <p className="text-xs text-slate-400">
                        {diag.jurisdiction} · {diag.code}
                      </p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>

        {/* ---- Results ---- */}
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader
              actions={
                calc ? (
                  <Button variant="ghost" size="sm" onClick={() => setShowTrace((v) => !v)}>
                    {showTrace ? "Hide trace" : "Show trace"}
                  </Button>
                ) : undefined
              }
            >
              <CardTitle>Federal (Form 1040)</CardTitle>
            </CardHeader>
            <CardBody>
              {!calc ? (
                <p className="text-sm text-slate-500">Run a calculation to see results.</p>
              ) : (
                <dl className="space-y-1.5 text-sm">
                  {(
                    [
                      ["Adjusted gross income", calc.federal.adjustedGrossIncome],
                      ["Taxable income", calc.federal.taxableIncome],
                      ["Income tax", calc.federal.incomeTax],
                      ["Child tax credit", calc.federal.childTaxCredit],
                      ["Earned income credit", calc.federal.earnedIncomeCredit],
                      ["Total tax", calc.federal.totalTax],
                      ["Total payments", calc.federal.totalPayments],
                    ] as Array<[string, number]>
                  ).map(([label, cents]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="font-medium">
                        <Money cents={cents} />
                      </dd>
                    </div>
                  ))}
                  <div
                    className={cx(
                      "mt-2 flex justify-between gap-4 rounded-lg px-3 py-2 text-base font-semibold",
                      calc.federal.refund > 0
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
                    )}
                  >
                    <dt>{calc.federal.refund > 0 ? "Federal refund" : "Federal balance due"}</dt>
                    <dd>
                      <Money
                        cents={
                          calc.federal.refund > 0 ? calc.federal.refund : calc.federal.balanceDue
                        }
                      />
                    </dd>
                  </div>
                </dl>
              )}
            </CardBody>
          </Card>

          {calc?.pennsylvania && (
            <Card>
              <CardHeader>
                <CardTitle>Pennsylvania (PA-40)</CardTitle>
              </CardHeader>
              <CardBody>
                <dl className="space-y-1.5 text-sm">
                  {(
                    [
                      ["PA taxable income", calc.pennsylvania.totalTaxableIncome],
                      ["Tax at 3.07%", calc.pennsylvania.taxLiability],
                      ["Tax forgiveness", calc.pennsylvania.taxForgiveness],
                      ["Payments", calc.pennsylvania.totalPayments],
                    ] as Array<[string, number]>
                  ).map(([label, cents]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="font-medium">
                        <Money cents={cents} />
                      </dd>
                    </div>
                  ))}
                  <div
                    className={cx(
                      "mt-2 flex justify-between gap-4 rounded-lg px-3 py-2 text-base font-semibold",
                      calc.pennsylvania.refund > 0 || calc.pennsylvania.balanceDue === 0
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
                    )}
                  >
                    <dt>{calc.pennsylvania.balanceDue > 0 ? "PA balance due" : "PA refund"}</dt>
                    <dd>
                      <Money
                        cents={
                          calc.pennsylvania.balanceDue > 0
                            ? calc.pennsylvania.balanceDue
                            : calc.pennsylvania.refund
                        }
                      />
                    </dd>
                  </div>
                </dl>
              </CardBody>
            </Card>
          )}

          {showTrace && calc && (
            <Card>
              <CardHeader>
                <CardTitle>Calculation trace</CardTitle>
              </CardHeader>
              <CardBody className="max-h-96 space-y-2 overflow-y-auto">
                {[...calc.federal.trace.entries, ...(calc.pennsylvania?.trace.entries ?? [])].map(
                  (entry) => (
                    <div
                      key={entry.lineId}
                      className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/80"
                    >
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="font-medium">{entry.label}</span>
                        <span className="font-semibold tabular-nums">
                          ${entry.valueDollars.toLocaleString("en-US")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{entry.formula}</p>
                      <p className="font-mono text-[10px] text-slate-400">
                        {entry.lineId} · rules {entry.ruleVersion}
                      </p>
                    </div>
                  ),
                )}
              </CardBody>
            </Card>
          )}

          {/* ---- Signature ---- */}
          {status === "AWAITING_SIGNATURE" &&
            (user?.role === "CLIENT" || user?.role === "ADMIN") && (
              <Card>
                <CardHeader>
                  <CardTitle>Sign your return</CardTitle>
                </CardHeader>
                <CardBody className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    By signing, you declare under penalties of perjury that you examined this return
                    and that it is true, correct, and complete, and you authorize GhimTech to
                    transmit it through its authorized e-file provider.
                  </p>
                  <Field label="Type your full legal name as your signature">
                    {(fid) => (
                      <Input
                        id={fid}
                        value={signatureText}
                        onChange={(e) => setSignatureText(e.target.value)}
                        placeholder="Full legal name"
                      />
                    )}
                  </Field>
                  <Button
                    onClick={sign}
                    disabled={Boolean(busy) || signatureText.trim().length < 2}
                  >
                    {busy === "sign" ? "Signing…" : "Sign and authorize e-file"}
                  </Button>
                </CardBody>
              </Card>
            )}

          {/* ---- Submissions ---- */}
          {(submissions.data ?? []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Filing submissions</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3">
                {(submissions.data ?? []).map((sub) => (
                  <div
                    key={sub.id}
                    className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">{sub.providerSubmissionId}</span>
                      <StatusBadge status={sub.state} />
                    </div>
                    <p className="text-xs text-slate-400">
                      {sub.submittedAt.slice(0, 19).replace("T", " ")}
                    </p>
                    {sub.acknowledgment?.agencyTrackingId && (
                      <p className="text-xs">
                        Tracking:{" "}
                        <span className="font-mono">{sub.acknowledgment.agencyTrackingId}</span>
                      </p>
                    )}
                    {sub.acknowledgment?.rejections.map((rej) => (
                      <div
                        key={rej.code}
                        className="mt-2 rounded bg-rose-50 p-2 text-xs dark:bg-rose-900/30"
                      >
                        <p className="font-semibold">
                          <Badge tone="danger">{rej.code}</Badge>
                        </p>
                        <p className="mt-1">{rej.explanation ?? rej.message}</p>
                        {rej.correctiveAction && (
                          <p className="mt-1 text-slate-500">Fix: {rej.correctiveAction}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
