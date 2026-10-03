import { describe, expect, it } from "vitest";

import {
  createReceptionChecklist,
  isReceptionEditable,
  ReceptionStatus,
} from "@/domain/reception";

describe("createReceptionChecklist", () => {
  it("returns the full catalog unchecked by default", () => {
    const checklist = createReceptionChecklist();

    expect(checklist.length).toBeGreaterThan(0);
    expect(checklist.every((item) => !item.checked)).toBe(true);
    expect(checklist[0]?.id).toBe("documentos");
  });

  it("marks the provided items as checked", () => {
    const checklist = createReceptionChecklist(["extintor", "tapetes"]);
    const checkedIds = checklist
      .filter((item) => item.checked)
      .map((item) => item.id);

    expect(checkedIds).toEqual(["extintor", "tapetes"]);
  });
});

describe("isReceptionEditable", () => {
  it("allows draft and in-progress only", () => {
    expect(isReceptionEditable(ReceptionStatus.Draft)).toBe(true);
    expect(isReceptionEditable(ReceptionStatus.InProgress)).toBe(true);
    expect(isReceptionEditable(ReceptionStatus.Completed)).toBe(false);
    expect(isReceptionEditable(ReceptionStatus.Cancelled)).toBe(false);
  });
});
