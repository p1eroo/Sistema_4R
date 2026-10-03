import { describe, expect, it } from "vitest";

import {
  DASHBOARD_SERVICE_RANKING,
  formatServiceDuration,
  isRankingService,
  sortServicesForCatalog,
} from "@/components/services/service-catalog-ranking";
import { serviceSeed } from "@/mocks/services/seed";

describe("service catalog ranking", () => {
  it("keeps the four dashboard ranking names", () => {
    const names = serviceSeed.map((service) => service.name);
    expect(DASHBOARD_SERVICE_RANKING).toEqual([
      "Mantenimiento preventivo",
      "Cambio de aceite",
      "Sistema de frenos",
      "Diagnóstico computarizado",
    ]);
    for (const name of DASHBOARD_SERVICE_RANKING) {
      expect(names).toContain(name);
      expect(isRankingService(name)).toBe(true);
    }
  });

  it("sorts ranking services first in dashboard order", () => {
    const sorted = sortServicesForCatalog(serviceSeed).map(
      (service) => service.name,
    );
    expect(sorted.slice(0, 4)).toEqual([...DASHBOARD_SERVICE_RANKING]);
  });

  it("formats duration for the seed", () => {
    expect(formatServiceDuration(60)).toBe("1 h");
    expect(formatServiceDuration(90)).toBe("1 h 30 min");
    expect(formatServiceDuration(45)).toBe("45 min");
  });
});
