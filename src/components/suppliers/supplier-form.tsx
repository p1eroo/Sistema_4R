import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAYMENT_TERMS_LABELS,
  PaymentTerms,
  supplierCreateSchema,
  type SupplierCreateValues,
} from "@/domain/suppliers";

export type SupplierFormProps = {
  submitting?: boolean;
  onSubmit: (values: SupplierCreateValues) => void | Promise<void>;
  onCancel?: () => void;
};

type Draft = {
  ruc: string;
  businessName: string;
  tradeName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  paymentTerms: PaymentTerms;
};

const EMPTY_DRAFT: Draft = {
  ruc: "",
  businessName: "",
  tradeName: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  address: "",
  paymentTerms: PaymentTerms.Days30,
};

export function SupplierForm({
  submitting = false,
  onSubmit,
  onCancel,
}: SupplierFormProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = supplierCreateSchema.safeParse({
          ruc: draft.ruc,
          businessName: draft.businessName,
          ...(draft.tradeName.trim()
            ? { tradeName: draft.tradeName.trim() }
            : {}),
          ...(draft.contactName.trim()
            ? {
                contact: {
                  name: draft.contactName.trim(),
                  ...(draft.contactPhone.trim()
                    ? { phone: draft.contactPhone.trim() }
                    : {}),
                  ...(draft.contactEmail.trim()
                    ? { email: draft.contactEmail.trim() }
                    : {}),
                },
              }
            : {}),
          ...(draft.address.trim() ? { address: draft.address.trim() } : {}),
          paymentTerms: draft.paymentTerms,
        });

        if (!parsed.success) {
          setError(
            parsed.error.issues[0]?.message ??
              "Revisa los datos del proveedor.",
          );
          return;
        }

        setError(null);
        void onSubmit(parsed.data);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="supplier-ruc">RUC</Label>
          <Input
            id="supplier-ruc"
            value={draft.ruc}
            onChange={(event) => update("ruc", event.target.value)}
            placeholder="20123456789"
            className="bg-background"
            inputMode="numeric"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="supplier-name">Razón social</Label>
          <Input
            id="supplier-name"
            value={draft.businessName}
            onChange={(event) => update("businessName", event.target.value)}
            placeholder="Filtros Lima SAC"
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="supplier-trade">Nombre comercial</Label>
          <Input
            id="supplier-trade"
            value={draft.tradeName}
            onChange={(event) => update("tradeName", event.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Condición de pago</Label>
          <Select
            value={draft.paymentTerms}
            onValueChange={(value) =>
              update("paymentTerms", value as PaymentTerms)
            }
          >
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PaymentTerms).map((term) => (
                <SelectItem key={term} value={term}>
                  {PAYMENT_TERMS_LABELS[term]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="supplier-contact">Contacto</Label>
          <Input
            id="supplier-contact"
            value={draft.contactName}
            onChange={(event) => update("contactName", event.target.value)}
            placeholder="Pedro Ruiz"
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="supplier-phone">Celular</Label>
          <Input
            id="supplier-phone"
            value={draft.contactPhone}
            onChange={(event) => update("contactPhone", event.target.value)}
            placeholder="987777888"
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="supplier-email">Correo</Label>
          <Input
            id="supplier-email"
            type="email"
            value={draft.contactEmail}
            onChange={(event) => update("contactEmail", event.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="supplier-address">Dirección</Label>
          <Input
            id="supplier-address"
            value={draft.address}
            onChange={(event) => update("address", event.target.value)}
            className="bg-background"
          />
        </div>
      </div>

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
