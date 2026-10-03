import type { AppSettings } from "@/domain/settings";

export const settingsSeed: AppSettings = {
  company: {
    legalName: "4 RUEDAS Mecánica Automotriz SAC",
    tradeName: "4 RUEDAS Mecánica Automotriz",
    ruc: "20512345678",
    address: "Av. Raúl Ferrero 1234, La Molina, Lima",
    phone: "014765100",
    email: "contacto@4ruedas.pe",
  },
  tax: {
    igvRate: 0.18,
    currency: "PEN",
  },
  documents: {
    invoiceSeries: "F001",
    workOrderPrefix: "OT",
    workOrderYear: 2026,
    quotePrefix: "COT",
  },
  ui: {
    locale: "es-PE",
    timeZone: "America/Lima",
    sidebarCollapsed: false,
  },
  updatedAt: "2026-02-15T10:00:00.000Z",
};
