import type { DateTimeIso } from "@/domain/shared";

export type CompanySettings = {
  readonly legalName: string;
  readonly tradeName: string;
  readonly ruc: string;
  readonly address: string;
  readonly phone: string;
  readonly email: string;
};

export type TaxSettings = {
  readonly igvRate: number;
  readonly currency: "PEN";
};

export type DocumentSettings = {
  readonly invoiceSeries: string;
  readonly workOrderPrefix: string;
  readonly workOrderYear: number;
  readonly quotePrefix: string;
};

export type UiPreferences = {
  readonly locale: string;
  readonly timeZone: string;
  readonly sidebarCollapsed: boolean;
};

export type AppSettings = {
  readonly company: CompanySettings;
  readonly tax: TaxSettings;
  readonly documents: DocumentSettings;
  readonly ui: UiPreferences;
  readonly updatedAt: DateTimeIso;
};

export type SettingsPatch = {
  readonly company?: Partial<CompanySettings>;
  readonly tax?: Partial<TaxSettings>;
  readonly documents?: Partial<DocumentSettings>;
  readonly ui?: Partial<UiPreferences>;
};
