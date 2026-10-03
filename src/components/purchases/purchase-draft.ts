import { solesToMoney } from "@/components/estimates/estimate-money";
import {
  purchaseLineSchema,
  type PurchaseLine,
  type PurchaseLineValues,
  type PurchaseTotals,
} from "@/domain/purchases";
import { asEntityId } from "@/domain/shared";
import { calculatePurchaseTotals } from "@/mocks/purchases/totals";

export const EMPTY_LINES_MESSAGE = "Agrega al menos una línea.";
export const MISSING_SUPPLIER_MESSAGE = "Selecciona un proveedor.";

export type PurchaseLineDraft = {
  readonly key: string;
  readonly productId: string;
  readonly description: string;
  readonly quantity: string;
  readonly unitCostSoles: string;
};

export type PurchaseLinesResult =
  | { readonly ok: true; readonly lines: PurchaseLineValues[] }
  | { readonly ok: false; readonly message: string };

export function emptyPurchaseLine(): PurchaseLineDraft {
  return {
    key: `line-${Math.random().toString(36).slice(2, 10)}`,
    productId: "",
    description: "",
    quantity: "1",
    unitCostSoles: "0",
  };
}

export function buildPurchaseLines(
  drafts: readonly PurchaseLineDraft[],
): PurchaseLinesResult {
  const filled = drafts.filter(
    (draft) => draft.productId.trim() || draft.description.trim(),
  );

  if (filled.length === 0) {
    return { ok: false, message: EMPTY_LINES_MESSAGE };
  }

  const lines: PurchaseLineValues[] = [];

  for (const draft of filled) {
    const parsed = purchaseLineSchema.safeParse({
      ...(draft.productId.trim()
        ? { productId: asEntityId(draft.productId.trim()) }
        : {}),
      description: draft.description,
      quantity: Math.floor(Number(draft.quantity)),
      unitCost: solesToMoney(draft.unitCostSoles),
      igvRate: 0.18,
    });

    if (!parsed.success) {
      return {
        ok: false,
        message:
          parsed.error.issues[0]?.message ?? "Revisa las líneas del documento.",
      };
    }

    lines.push(parsed.data);
  }

  return { ok: true, lines };
}

export function previewPurchaseTotals(
  drafts: readonly PurchaseLineDraft[],
): PurchaseTotals {
  const built = buildPurchaseLines(drafts);
  if (!built.ok) {
    return calculatePurchaseTotals([]);
  }

  const lines: PurchaseLine[] = built.lines.map((line, index) => ({
    id: asEntityId(`PREVIEW-${index + 1}`),
    description: line.description,
    quantity: line.quantity,
    unitCost: line.unitCost,
    igvRate: line.igvRate ?? 0.18,
    ...(line.productId !== undefined ? { productId: line.productId } : {}),
    ...(line.discount !== undefined ? { discount: line.discount } : {}),
  }));

  return calculatePurchaseTotals(lines);
}
