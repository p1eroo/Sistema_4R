import { money, type Money } from "@/domain/shared";

export function solesToMoney(value: string): Money {
  const parsed = Number(value.trim().replace(",", "."));
  return money(Number.isFinite(parsed) ? parsed * 100 : 0);
}
