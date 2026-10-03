import {
  DiscountType,
  PromotionScope,
  PromotionStatus,
  type Promotion,
} from "@/domain/pricing";
import { asEntityId } from "@/domain/shared";

const SEED_CREATED_AT = "2026-01-05T09:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-15T10:00:00.000Z";

export const promotionSeed: Promotion[] = [
  {
    id: asEntityId("PROMO-0001"),
    code: "MANT-10",
    name: "10% en mantenimiento preventivo",
    description: "Descuento vigente para el servicio de mantenimiento.",
    discount: { type: DiscountType.Percentage, value: 10 },
    scope: PromotionScope.Services,
    targetIds: [asEntityId("SRV-0001")],
    status: PromotionStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("PROMO-0002"),
    code: "FRENOS-20",
    name: "S/ 20 de descuento en frenos",
    discount: {
      type: DiscountType.FixedAmount,
      value: 2000,
    },
    scope: PromotionScope.Category,
    targetIds: [asEntityId("CAT-0001")],
    status: PromotionStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("PROMO-0003"),
    code: "ACEITE-5",
    name: "5% en aceites",
    discount: { type: DiscountType.Percentage, value: 5 },
    scope: PromotionScope.Category,
    targetIds: [asEntityId("CAT-0003")],
    status: PromotionStatus.Inactive,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
];
