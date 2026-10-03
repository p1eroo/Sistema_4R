import { describe, expect, it } from "vitest";

import {
  BayStatus,
  BAY_STATUS_LABELS,
  createDeliveryChecklist,
  createQualityChecklist,
  DeliveryStatus,
  DELIVERY_STATUS_LABELS,
  QualityResult,
  QUALITY_RESULT_LABELS,
  WORKSHOP_BAY_CAPACITY,
} from "@/domain/workshop-ops";

describe("bay status", () => {
  it("labels every bay status in Spanish", () => {
    for (const status of Object.values(BayStatus)) {
      expect(BAY_STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it("has capacity for the dashboard load", () => {
    expect(WORKSHOP_BAY_CAPACITY).toBeGreaterThanOrEqual(24);
  });
});

describe("quality and delivery labels", () => {
  it("labels results and delivery statuses", () => {
    for (const result of Object.values(QualityResult)) {
      expect(QUALITY_RESULT_LABELS[result]).toBeTruthy();
    }
    for (const status of Object.values(DeliveryStatus)) {
      expect(DELIVERY_STATUS_LABELS[status]).toBeTruthy();
    }
  });
});

describe("checklist factories", () => {
  it("creates a quality checklist marking passed items", () => {
    const checklist = createQualityChecklist(["frenos"]);
    expect(checklist.find((item) => item.id === "frenos")?.passed).toBe(true);
    expect(checklist.find((item) => item.id === "luces")?.passed).toBe(false);
  });

  it("creates a delivery checklist marking checked items", () => {
    const checklist = createDeliveryChecklist(["pago"]);
    expect(checklist.find((item) => item.id === "pago")?.checked).toBe(true);
    expect(checklist.find((item) => item.id === "llaves")?.checked).toBe(false);
  });
});
