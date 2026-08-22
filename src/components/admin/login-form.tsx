"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdminAction, type AdminActionState } from "@/server/admin/actions";

const initial: AdminActionState = { ok: true };

export function AdminLoginForm({
  nextPath,
}: {
  nextPath?: string;
}) {
  const [state, action, pending] = useActionState(loginAdminAction, initial);

  return (
    <form action={action} className="space-y-5">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      <div>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div>
        <Label htmlFor="password" required>
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
        />
      </div>
      {state?.error ? (
        <p
          className="border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full rounded-none" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
