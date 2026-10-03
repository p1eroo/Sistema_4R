import { QualityResult } from "@/domain/workshop-ops";

export function qualityResultVariant(
  result: QualityResult,
): "success" | "danger" {
  return result === QualityResult.Pass ? "success" : "danger";
}
