import { describe, expect, it } from "vitest";

import {
  advanceOverdraw,
  canConfirmCheckout,
  cashTenderSuggestions,
  initialPaymentRows,
  createPaymentRow,
  defaultCashRow,
  paymentChange,
  paymentShortfall,
  rowsToPaymentValues,
  sumPaymentRows,
} from "@/components/pos/pos-payment-plan";
import { PaymentMethod } from "@/domain/pos";
import { money } from "@/domain/shared";

const total = {
  subtotal: money(17000),
  discount: money(0),
  igv: money(3060),
  total: money(20060),
};

describe("pos payment plan", () => {
  it("detects shortfall and change", () => {
    const rows = [
      createPaymentRow(PaymentMethod.Cash, "100"),
      createPaymentRow(PaymentMethod.Yape, "50.50"),
    ];

    expect(sumPaymentRows(rows).amount).toBe(15050);
    expect(paymentShortfall(rows, total.total).amount).toBe(5010);
    expect(canConfirmCheckout(rows, total.total)).toBe(false);

    const covered = [
      createPaymentRow(PaymentMethod.Cash, "150"),
      createPaymentRow(PaymentMethod.Card, "50.60"),
    ];
    expect(canConfirmCheckout(covered, total.total)).toBe(true);
    expect(paymentChange(covered, total.total).amount).toBe(0);

    const withChange = [createPaymentRow(PaymentMethod.Cash, "250")];
    expect(paymentChange(withChange, total.total).amount).toBe(4940);
  });

  it("builds payment values for mixed checkout", () => {
    const rows = [
      createPaymentRow(PaymentMethod.Cash, "100"),
      createPaymentRow(PaymentMethod.Transfer, "100.60"),
    ];

    expect(rowsToPaymentValues(rows)).toEqual([
      { method: PaymentMethod.Cash, amount: money(10000) },
      { method: PaymentMethod.Transfer, amount: money(10060) },
    ]);
  });

  it("seeds cash row from ticket total", () => {
    const row = defaultCashRow(total);
    expect(row.method).toBe(PaymentMethod.Cash);
    expect(row.amountSoles).toBe("200.60");
  });
});

describe("initialPaymentRows", () => {
  it("uses the advance balance first and completes with cash", () => {
    const rows = initialPaymentRows(
      PaymentMethod.Advance,
      money(50000),
      money(30000),
    );

    expect(rows.map((row) => [row.method, row.amountSoles])).toEqual([
      [PaymentMethod.Advance, "300.00"],
      [PaymentMethod.Cash, "200.00"],
    ]);
  });

  it("splits a mixed payment between cash and card", () => {
    const rows = initialPaymentRows(PaymentMethod.Mixed, money(10001));

    expect(rows.map((row) => row.method)).toEqual([
      PaymentMethod.Cash,
      PaymentMethod.Card,
    ]);
    expect(sumPaymentRows(rows).amount).toBe(10001);
  });
});

describe("advanceOverdraw", () => {
  it("reports the advance amount beyond the customer balance", () => {
    const rows = [createPaymentRow(PaymentMethod.Advance, "350")];

    expect(advanceOverdraw(rows, money(30000)).amount).toBe(5000);
    expect(advanceOverdraw(rows, money(40000)).amount).toBe(0);
  });
});

describe("cashTenderSuggestions", () => {
  it("offers exact amount and rounded bills", () => {
    expect(
      cashTenderSuggestions(money(8260)).map((value) => value.amount),
    ).toEqual([8260, 9000, 10000, 20000]);
  });
});
