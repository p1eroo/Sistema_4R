import { describe, expect, it } from "vitest";

import {
  SettingsValidationError,
  createSettingsService,
} from "@/mocks/settings/service";

describe("settingsService", () => {
  it("returns the 4 RUEDAS company settings", async () => {
    const settings = await createSettingsService().get();

    expect(settings.company.tradeName).toBe("4 RUEDAS Mecánica Automotriz");
    expect(settings.tax.igvRate).toBe(0.18);
    expect(settings.documents.invoiceSeries).toBe("F001");
  });

  it("updates a section partially and rereads it", async () => {
    const service = createSettingsService();

    const updated = await service.update({
      tax: { igvRate: 0.1 },
      documents: { workOrderYear: 2027 },
    });

    expect(updated.tax.igvRate).toBe(0.1);
    expect(updated.tax.currency).toBe("PEN");
    expect(updated.documents.workOrderYear).toBe(2027);
    expect(updated.documents.invoiceSeries).toBe("F001");

    expect((await service.get()).tax.igvRate).toBe(0.1);
  });

  it("rejects an out-of-range IGV", async () => {
    await expect(
      createSettingsService().update({ tax: { igvRate: 2 } }),
    ).rejects.toBeInstanceOf(SettingsValidationError);
  });
});
