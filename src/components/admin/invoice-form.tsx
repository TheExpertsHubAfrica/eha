"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label, FieldHint } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { pesewasToGhs } from "@/lib/money";
import { saveInvoiceAction } from "@/server/admin/payment-actions";

export function AdminInvoiceForm({
  invoice,
}: {
  invoice?: {
    id: string;
    invoiceNumber: string;
    title: string;
    description: string;
    status: string;
    amountPesewas: number | null;
  };
}) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const defaultAmount =
    invoice?.amountPesewas != null ? String(pesewasToGhs(invoice.amountPesewas)) : "";

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(undefined);
    const result = await saveInvoiceAction(invoice?.id ?? null, formData);
    if (result && !result.ok) {
      setError(result.error);
      toast.error(result.error);
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="invoiceNumber">Invoice number</Label>
          <Input
            id="invoiceNumber"
            name="invoiceNumber"
            defaultValue={invoice?.invoiceNumber}
            placeholder="Leave blank to auto-generate"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <NativeSelect id="status" name="status" defaultValue={invoice?.status ?? "open"}>
            <option value="open">open</option>
            <option value="closed">closed</option>
            <option value="void">void</option>
          </NativeSelect>
        </div>
      </div>
      <div>
        <Label htmlFor="title" required>
          Title
        </Label>
        <Input id="title" name="title" required defaultValue={invoice?.title} />
      </div>
      <div>
        <Label htmlFor="amountGhs">Fixed amount (GHS) — optional</Label>
        <Input
          id="amountGhs"
          name="amountGhs"
          type="number"
          min="1"
          step="0.01"
          inputMode="decimal"
          defaultValue={defaultAmount}
          placeholder="Leave blank to let the payer choose"
        />
        <FieldHint>
          If set, the payer must pay this exact amount. Leave blank for open-amount invoices.
        </FieldHint>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={invoice?.description} />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : invoice ? "Save invoice" : "Create invoice"}
      </Button>
    </form>
  );
}
