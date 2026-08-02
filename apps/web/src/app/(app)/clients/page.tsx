"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  Input,
  Skeleton,
  Table,
  TCell,
  THead,
  TRow,
} from "@ghimtech/ui";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";

interface ClientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  tinMasked: string;
  tags: string[];
  createdAt: string;
}

export default function ClientsPage() {
  const { data, error, loading, refetch } = useApi<ClientRow[]>("/clients");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    tin: "",
    dateOfBirth: "",
    line1: "",
    city: "",
    state: "PA",
    zip: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function createClient(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFormError(undefined);
    try {
      await api("/clients", {
        method: "POST",
        body: {
          name: { firstName: form.firstName, lastName: form.lastName },
          email: form.email,
          tin: form.tin,
          dateOfBirth: form.dateOfBirth,
          address: { line1: form.line1, city: form.city, state: form.state, zip: form.zip },
        },
      });
      setShowForm(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        tin: "",
        dateOfBirth: "",
        line1: "",
        city: "",
        state: "PA",
        zip: "",
      });
      await refetch();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-slate-500">Taxpayers served by GhimTech Tax.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "New client"}</Button>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New client</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={createClient} className="grid gap-4 md:grid-cols-2">
              {formError && (
                <div className="md:col-span-2">
                  <Alert tone="danger">{formError}</Alert>
                </div>
              )}
              <Field label="First name">
                {(id) => (
                  <Input
                    id={id}
                    required
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                  />
                )}
              </Field>
              <Field label="Last name">
                {(id) => (
                  <Input
                    id={id}
                    required
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                  />
                )}
              </Field>
              <Field label="Email">
                {(id) => (
                  <Input
                    id={id}
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                )}
              </Field>
              <Field
                label="SSN / ITIN"
                hint="Stored encrypted; only the last four digits are ever displayed."
              >
                {(id) => (
                  <Input
                    id={id}
                    required
                    placeholder="###-##-####"
                    value={form.tin}
                    onChange={(e) => set("tin", e.target.value)}
                  />
                )}
              </Field>
              <Field label="Date of birth">
                {(id) => (
                  <Input
                    id={id}
                    type="date"
                    required
                    value={form.dateOfBirth}
                    onChange={(e) => set("dateOfBirth", e.target.value)}
                  />
                )}
              </Field>
              <Field label="Street address">
                {(id) => (
                  <Input
                    id={id}
                    required
                    value={form.line1}
                    onChange={(e) => set("line1", e.target.value)}
                  />
                )}
              </Field>
              <Field label="City">
                {(id) => (
                  <Input
                    id={id}
                    required
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                )}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="State">
                  {(id) => (
                    <Input
                      id={id}
                      required
                      maxLength={2}
                      value={form.state}
                      onChange={(e) => set("state", e.target.value.toUpperCase())}
                    />
                  )}
                </Field>
                <Field label="ZIP">
                  {(id) => (
                    <Input
                      id={id}
                      required
                      value={form.zip}
                      onChange={(e) => set("zip", e.target.value)}
                    />
                  )}
                </Field>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={busy}>
                  {busy ? "Creating…" : "Create client"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        {loading ? (
          <CardBody>
            <Skeleton className="h-32" />
          </CardBody>
        ) : (data ?? []).length === 0 ? (
          <CardBody>
            <EmptyState
              title="No clients yet"
              hint="Create the first client to begin a 2025 federal and Pennsylvania return."
            />
          </CardBody>
        ) : (
          <Table>
            <THead columns={["Name", "Email", "SSN", "Tags", "Added"]} />
            <tbody>
              {(data ?? []).map((client) => (
                <TRow key={client.id}>
                  <TCell>
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                    >
                      {client.lastName}, {client.firstName}
                    </Link>
                  </TCell>
                  <TCell>{client.email}</TCell>
                  <TCell className="font-mono text-xs">{client.tinMasked}</TCell>
                  <TCell>{client.tags.join(", ")}</TCell>
                  <TCell className="text-slate-400">{client.createdAt.slice(0, 10)}</TCell>
                </TRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
