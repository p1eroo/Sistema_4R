export type CurrencyCode = "PEN";

export type Money = {
  readonly amount: number;
  readonly currency: CurrencyCode;
};

export const PEN: CurrencyCode = "PEN";

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  PEN: "S/",
};

export function money(amount: number, currency: CurrencyCode = PEN): Money {
  return { amount: Math.round(amount), currency };
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function multiplyMoney(value: Money, factor: number): Money {
  return {
    amount: Math.round(value.amount * factor),
    currency: value.currency,
  };
}

export function formatMoney(value: Money): string {
  const symbol = CURRENCY_SYMBOLS[value.currency];
  const sign = value.amount < 0 ? "-" : "";
  const absolute = Math.abs(value.amount);
  const whole = Math.floor(absolute / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const cents = (absolute % 100).toString().padStart(2, "0");

  return `${sign}${symbol} ${whole}.${cents}`;
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error("No se pueden combinar montos de distinta moneda.");
  }
}
