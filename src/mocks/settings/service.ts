import type { AppSettings, SettingsPatch } from "@/domain/settings";
import { nowIso } from "@/domain/shared";
import { settingsSeed } from "@/mocks/settings/seed";

export class SettingsValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "La configuración no es válida.");
    this.name = "SettingsValidationError";
    this.issues = issues;
  }
}

export type SettingsService = {
  get(): Promise<AppSettings>;
  update(patch: SettingsPatch): Promise<AppSettings>;
};

export function createSettingsService(
  initial: AppSettings = settingsSeed,
): SettingsService {
  let current: AppSettings = structuredClone(initial);

  return {
    async get() {
      return structuredClone(current);
    },

    async update(patch: SettingsPatch) {
      if (
        patch.tax?.igvRate !== undefined &&
        (patch.tax.igvRate < 0 || patch.tax.igvRate > 1)
      ) {
        throw new SettingsValidationError([
          "El IGV debe estar entre 0 y 1 (por ejemplo 0.18).",
        ]);
      }

      current = {
        company: { ...current.company, ...patch.company },
        tax: { ...current.tax, ...patch.tax },
        documents: { ...current.documents, ...patch.documents },
        ui: { ...current.ui, ...patch.ui },
        updatedAt: nowIso(),
      };

      return structuredClone(current);
    },
  };
}

export const settingsService: SettingsService = createSettingsService();
