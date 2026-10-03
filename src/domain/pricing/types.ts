import type { DateTimeIso, EntityId, Money } from "@/domain/shared";

export enum DiscountType {
  Percentage = "percentage",
  FixedAmount = "fixed_amount",
}

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  [DiscountType.Percentage]: "Porcentaje",
  [DiscountType.FixedAmount]: "Monto fijo",
};

export type Discount = {
  readonly type: DiscountType;
  readonly value: number;
  readonly maxAmount?: Money | undefined;
};

export enum PromotionStatus {
  Active = "active",
  Inactive = "inactive",
}

export const PROMOTION_STATUS_LABELS: Record<PromotionStatus, string> = {
  [PromotionStatus.Active]: "Activa",
  [PromotionStatus.Inactive]: "Inactiva",
};

export enum PromotionScope {
  All = "all",
  Products = "products",
  Services = "services",
  Category = "category",
}

export const PROMOTION_SCOPE_LABELS: Record<PromotionScope, string> = {
  [PromotionScope.All]: "Todo el catálogo",
  [PromotionScope.Products]: "Productos",
  [PromotionScope.Services]: "Servicios",
  [PromotionScope.Category]: "Categoría",
};

export type PromotionTarget = {
  readonly productId?: EntityId | undefined;
  readonly serviceId?: EntityId | undefined;
  readonly categoryId?: EntityId | undefined;
};

export type Promotion = {
  readonly id: EntityId;
  readonly code: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly discount: Discount;
  readonly scope: PromotionScope;
  readonly targetIds?: readonly EntityId[] | undefined;
  readonly status: PromotionStatus;
  readonly startsAt?: DateTimeIso | undefined;
  readonly endsAt?: DateTimeIso | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export function isPromotionActive(
  promotion: Promotion,
  at: Date = new Date(),
): boolean {
  if (promotion.status !== PromotionStatus.Active) {
    return false;
  }

  const time = at.getTime();
  if (promotion.startsAt && Date.parse(promotion.startsAt) > time) {
    return false;
  }
  if (promotion.endsAt && Date.parse(promotion.endsAt) < time) {
    return false;
  }

  return true;
}

export function promotionMatchesTarget(
  promotion: Promotion,
  target: PromotionTarget,
): boolean {
  if (promotion.scope === PromotionScope.All) {
    return true;
  }

  const ids = promotion.targetIds ?? [];
  if (ids.length === 0) {
    return false;
  }

  if (promotion.scope === PromotionScope.Products && target.productId) {
    return ids.includes(target.productId);
  }
  if (promotion.scope === PromotionScope.Services && target.serviceId) {
    return ids.includes(target.serviceId);
  }
  if (promotion.scope === PromotionScope.Category && target.categoryId) {
    return ids.includes(target.categoryId);
  }

  return false;
}
