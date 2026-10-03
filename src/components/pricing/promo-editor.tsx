import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  dateKeyToIso,
  formatPromoPreview,
  isoToDateKey,
} from "@/components/pricing/promo-preview";
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
import { CatalogStatus } from "@/domain/catalog";
import {
  DISCOUNT_TYPE_LABELS,
  DiscountType,
  PROMOTION_SCOPE_LABELS,
  PromotionScope,
  promotionCreateSchema,
  type Discount,
  type Promotion,
  type PromotionCreateValues,
} from "@/domain/pricing";
import { money } from "@/domain/shared";
import { categoryService } from "@/mocks/catalog/service";
import { productService } from "@/mocks/products/service";
import { serviceCatalog } from "@/mocks/services/service";

export type PromoEditorProps = {
  promotion?: Promotion;
  submitting?: boolean;
  onSubmit: (values: PromotionCreateValues) => void | Promise<void>;
  onCancel?: () => void;
};

type Draft = {
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  percent: string;
  fixedSoles: string;
  scope: PromotionScope;
  targetId: string;
  startsOn: string;
  endsOn: string;
  previewSoles: string;
};

function discountFromDraft(draft: Draft): Discount | string {
  if (draft.discountType === DiscountType.Percentage) {
    const value = Number(draft.percent);
    if (!Number.isInteger(value)) {
      return "El porcentaje debe ser un número entero.";
    }
    return { type: DiscountType.Percentage, value };
  }

  const soles = Number(draft.fixedSoles.replace(",", "."));
  if (!Number.isFinite(soles) || soles < 0) {
    return "El monto fijo no es válido.";
  }

  return {
    type: DiscountType.FixedAmount,
    value: Math.round(soles * 100),
  };
}

function draftFromPromotion(promotion?: Promotion): Draft {
  if (!promotion) {
    return {
      code: "",
      name: "",
      description: "",
      discountType: DiscountType.Percentage,
      percent: "15",
      fixedSoles: "",
      scope: PromotionScope.Services,
      targetId: "SRV-0001",
      startsOn: "",
      endsOn: "",
      previewSoles: "180.00",
    };
  }

  const isPercent = promotion.discount.type === DiscountType.Percentage;
  return {
    code: promotion.code,
    name: promotion.name,
    description: promotion.description ?? "",
    discountType: promotion.discount.type,
    percent: isPercent ? String(promotion.discount.value) : "",
    fixedSoles: isPercent ? "" : (promotion.discount.value / 100).toFixed(2),
    scope: promotion.scope,
    targetId: promotion.targetIds?.[0] ?? "none",
    startsOn: isoToDateKey(promotion.startsAt),
    endsOn: isoToDateKey(promotion.endsAt),
    previewSoles: "180.00",
  };
}

export function PromoEditor({
  promotion,
  submitting = false,
  onSubmit,
  onCancel,
}: PromoEditorProps) {
  const [draft, setDraft] = useState<Draft>(() =>
    draftFromPromotion(promotion),
  );
  const [error, setError] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ["products", "promo-targets"],
    queryFn: () => productService.list({ pageSize: 100 }),
  });
  const servicesQuery = useQuery({
    queryKey: ["services", "promo-targets"],
    queryFn: () => serviceCatalog.list({ pageSize: 100 }),
  });
  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories", "promo-targets"],
    queryFn: () => categoryService.list({ pageSize: 100 }),
  });

  const targetOptions = useMemo(() => {
    if (draft.scope === PromotionScope.Products) {
      return (productsQuery.data?.items ?? []).map((item) => ({
        id: item.id,
        label: `${item.name} · ${item.sku}`,
      }));
    }
    if (draft.scope === PromotionScope.Services) {
      return (servicesQuery.data?.items ?? []).map((item) => ({
        id: item.id,
        label: item.name,
      }));
    }
    if (draft.scope === PromotionScope.Category) {
      return (categoriesQuery.data?.items ?? [])
        .filter((item) => item.status === CatalogStatus.Active)
        .map((item) => ({ id: item.id, label: item.name }));
    }
    return [];
  }, [
    draft.scope,
    productsQuery.data?.items,
    servicesQuery.data?.items,
    categoriesQuery.data?.items,
  ]);

  const preview = useMemo(() => {
    const soles = Number(draft.previewSoles.replace(",", "."));
    const discount = discountFromDraft(draft);
    if (typeof discount === "string" || !Number.isFinite(soles) || soles < 0) {
      return null;
    }
    return formatPromoPreview(money(Math.round(soles * 100)), discount);
  }, [draft]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const discount = discountFromDraft(draft);
        if (typeof discount === "string") {
          setError(discount);
          return;
        }

        const needsTarget = draft.scope !== PromotionScope.All;
        if (needsTarget && (draft.targetId === "none" || !draft.targetId)) {
          setError("Selecciona el alcance (producto, servicio o categoría).");
          return;
        }

        const parsed = promotionCreateSchema.safeParse({
          code: draft.code,
          name: draft.name,
          ...(draft.description.trim()
            ? { description: draft.description.trim() }
            : {}),
          discount,
          scope: draft.scope,
          ...(needsTarget ? { targetIds: [draft.targetId] } : {}),
          ...(draft.startsOn ? { startsAt: dateKeyToIso(draft.startsOn) } : {}),
          ...(draft.endsOn ? { endsAt: dateKeyToIso(draft.endsOn, true) } : {}),
        });

        if (!parsed.success) {
          setError(
            parsed.error.issues[0]?.message ??
              "Revisa los datos de la promoción.",
          );
          return;
        }

        setError(null);
        void onSubmit(parsed.data);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="promo-code">Código</Label>
          <Input
            id="promo-code"
            value={draft.code}
            onChange={(event) => update("code", event.target.value)}
            placeholder="VERANO-15"
            className="bg-background uppercase"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="promo-name">Nombre</Label>
          <Input
            id="promo-name"
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="15% de verano"
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Tipo de descuento</Label>
          <Select
            value={draft.discountType}
            onValueChange={(value) =>
              update("discountType", value as DiscountType)
            }
          >
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(DiscountType).map((type) => (
                <SelectItem key={type} value={type}>
                  {DISCOUNT_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {draft.discountType === DiscountType.Percentage ? (
          <div className="space-y-1.5">
            <Label htmlFor="promo-percent">Porcentaje</Label>
            <Input
              id="promo-percent"
              type="number"
              min="0"
              max="100"
              step="1"
              value={draft.percent}
              onChange={(event) => update("percent", event.target.value)}
              className="bg-background"
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="promo-fixed">Monto fijo (S/)</Label>
            <Input
              id="promo-fixed"
              type="number"
              min="0"
              step="0.01"
              value={draft.fixedSoles}
              onChange={(event) => update("fixedSoles", event.target.value)}
              className="bg-background"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label>Alcance</Label>
          <Select
            value={draft.scope}
            onValueChange={(value) => {
              update("scope", value as PromotionScope);
              update("targetId", "none");
            }}
          >
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PromotionScope).map((scope) => (
                <SelectItem key={scope} value={scope}>
                  {PROMOTION_SCOPE_LABELS[scope]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {draft.scope !== PromotionScope.All ? (
          <div className="space-y-1.5">
            <Label>Objetivo</Label>
            <Select
              value={draft.targetId}
              onValueChange={(value) => update("targetId", value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Selecciona</SelectItem>
                {targetOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="promo-start">Vigencia desde</Label>
          <Input
            id="promo-start"
            type="date"
            value={draft.startsOn}
            onChange={(event) => update("startsOn", event.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="promo-end">Vigencia hasta</Label>
          <Input
            id="promo-end"
            type="date"
            value={draft.endsOn}
            onChange={(event) => update("endsOn", event.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="promo-description">Descripción</Label>
          <Input
            id="promo-description"
            value={draft.description}
            onChange={(event) => update("description", event.target.value)}
            className="bg-background"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor="promo-preview">Precio de preview (S/)</Label>
            <Input
              id="promo-preview"
              type="number"
              min="0"
              step="0.01"
              value={draft.previewSoles}
              onChange={(event) => update("previewSoles", event.target.value)}
              className="bg-background"
            />
          </div>
          {preview ? (
            <p className="text-xs text-muted-foreground">
              {preview.original} − {preview.saved} ={" "}
              <strong className="text-foreground">{preview.final}</strong>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Ingresa un precio para previsualizar.
            </p>
          )}
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
          {submitting ? "Guardando…" : "Activar"}
        </Button>
      </div>
    </form>
  );
}
