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
  SERVICE_CATEGORY_LABELS,
  ServiceCategory,
  serviceCreateSchema,
  type ServiceCreateValues,
  type ServiceItem,
} from "@/domain/services";
import { money } from "@/domain/shared";

export type ServiceFormProps = {
  service?: ServiceItem;
  mode?: "create" | "edit";
  submitting?: boolean;
  onSubmit: (values: ServiceCreateValues) => void | Promise<void>;
  onCancel?: () => void;
};

type Draft = {
  code: string;
  name: string;
  category: ServiceCategory;
  priceSoles: string;
  minutes: string;
  description: string;
};

function solesFromCents(amount: number): string {
  return (amount / 100).toFixed(2);
}

function draftFromService(service?: ServiceItem): Draft {
  if (!service) {
    return {
      code: "",
      name: "",
      category: ServiceCategory.Maintenance,
      priceSoles: "",
      minutes: "60",
      description: "",
    };
  }

  return {
    code: service.code,
    name: service.name,
    category: service.category,
    priceSoles: solesFromCents(service.price.amount),
    minutes: String(service.estimatedMinutes),
    description: service.description ?? "",
  };
}

function parseDraft(draft: Draft): ServiceCreateValues | string {
  const priceNumber = Number(draft.priceSoles.replace(",", "."));
  const minutes = Number(draft.minutes);

  if (!Number.isFinite(priceNumber) || priceNumber < 0) {
    return "El precio no es válido.";
  }

  const parsed = serviceCreateSchema.safeParse({
    code: draft.code,
    name: draft.name,
    category: draft.category,
    estimatedMinutes: minutes,
    price: money(Math.round(priceNumber * 100)),
    ...(draft.description.trim()
      ? { description: draft.description.trim() }
      : {}),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Revisa los datos del servicio.";
  }

  return parsed.data;
}

export function ServiceForm({
  service,
  mode = service ? "edit" : "create",
  submitting = false,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const [draft, setDraft] = useState<Draft>(() => draftFromService(service));
  const [error, setError] = useState<string | null>(null);
  const isEdit = mode === "edit";

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = parseDraft(draft);
        if (typeof parsed === "string") {
          setError(parsed);
          return;
        }
        setError(null);
        void onSubmit(parsed);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="service-code">Código</Label>
          <Input
            id="service-code"
            value={draft.code}
            onChange={(event) => update("code", event.target.value)}
            placeholder="SRV-007"
            className="uppercase"
            disabled={isEdit}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="service-name">Nombre</Label>
          <Input
            id="service-name"
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Cambio de aceite"
            disabled={isEdit}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <Select
            value={draft.category}
            onValueChange={(value) =>
              update("category", value as ServiceCategory)
            }
            disabled={isEdit}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ServiceCategory).map((category) => (
                <SelectItem key={category} value={category}>
                  {SERVICE_CATEGORY_LABELS[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="service-price">Precio (S/)</Label>
          <Input
            id="service-price"
            type="number"
            min="0"
            step="0.01"
            value={draft.priceSoles}
            onChange={(event) => update("priceSoles", event.target.value)}
            placeholder="90.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="service-minutes">Duración (min)</Label>
          <Input
            id="service-minutes"
            type="number"
            min="15"
            step="15"
            value={draft.minutes}
            onChange={(event) => update("minutes", event.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="service-description">Descripción</Label>
          <Input
            id="service-description"
            value={draft.description}
            onChange={(event) => update("description", event.target.value)}
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
