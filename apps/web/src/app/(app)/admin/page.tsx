"use client";
import { useState } from "react";
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
  Select,
  Skeleton,
  Table,
  TCell,
  THead,
  TRow,
} from "@ghimtech/ui";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  disabled: boolean;
  mfaEnrolled: boolean;
}

export default function AdminPage() {
  const users = useApi<UserRow[]>("/users");
  const [form, setForm] = useState({
    email: "",
    name: "",
    role: "PREPARER",
    temporaryPassword: "",
  });
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string }>();
  const [busy, setBusy] = useState(false);

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(undefined);
    try {
      await api("/users", { method: "POST", body: form });
      setNotice({
        tone: "success",
        text: `${form.email} created. Share the temporary password securely — a reset and MFA enrollment are forced at first sign-in.`,
      });
      setForm({ email: "", name: "", role: "PREPARER", temporaryPassword: "" });
      await users.refetch();
    } catch (err) {
      setNotice({ tone: "danger", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function disable(id: string) {
    await api(`/users/${id}/disable`, { method: "POST" });
    await users.refetch();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Administration</h1>
        <p className="text-sm text-slate-500">User management and platform configuration.</p>
      </div>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Create user</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={createUser} className="grid gap-4 md:grid-cols-4">
            <Field label="Email">
              {(id) => (
                <Input
                  id={id}
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              )}
            </Field>
            <Field label="Name">
              {(id) => (
                <Input
                  id={id}
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              )}
            </Field>
            <Field label="Role">
              {(id) => (
                <Select
                  id={id}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {["PREPARER", "REVIEWER", "AUDITOR", "ADMIN"].map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Temporary password" hint="Min 12 chars; reset forced at first sign-in.">
              {(id) => (
                <Input
                  id={id}
                  type="password"
                  required
                  minLength={12}
                  value={form.temporaryPassword}
                  onChange={(e) => setForm({ ...form, temporaryPassword: e.target.value })}
                />
              )}
            </Field>
            <div className="md:col-span-4">
              <Button type="submit" disabled={busy}>
                {busy ? "Creating…" : "Create user"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        {users.loading ? (
          <CardBody>
            <Skeleton className="h-24" />
          </CardBody>
        ) : (
          <Table>
            <THead columns={["Name", "Email", "Role", "MFA", "Status", ""]} />
            <tbody>
              {(users.data ?? []).map((user) => (
                <TRow key={user.id}>
                  <TCell className="font-medium">{user.name}</TCell>
                  <TCell>{user.email}</TCell>
                  <TCell>
                    <Badge tone="brand">{user.role}</Badge>
                  </TCell>
                  <TCell>
                    <Badge tone={user.mfaEnrolled ? "success" : "warning"}>
                      {user.mfaEnrolled ? "Enrolled" : "Pending"}
                    </Badge>
                  </TCell>
                  <TCell>
                    <Badge tone={user.disabled ? "danger" : "success"}>
                      {user.disabled ? "Disabled" : "Active"}
                    </Badge>
                  </TCell>
                  <TCell>
                    {!user.disabled && (
                      <Button variant="ghost" size="sm" onClick={() => disable(user.id)}>
                        Disable
                      </Button>
                    )}
                  </TCell>
                </TRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>E-file provider</CardTitle>
        </CardHeader>
        <CardBody className="text-sm text-slate-600 dark:text-slate-300">
          <p>
            Active provider: <Badge tone="info">mock</Badge> — the deterministic development
            provider. Sandbox and real authorized-transmitter adapters are configured via{" "}
            <code className="font-mono text-xs">GHIMTECH_EFILE_PROVIDER</code>; provider-specific
            code never touches core business logic.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
