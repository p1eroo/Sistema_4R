import { DiagnosticStatus } from "@/domain/diagnostics";

export function diagnosticStatusVariant(
  status: DiagnosticStatus,
): "info" | "success" | "warning" {
  switch (status) {
    case DiagnosticStatus.Reviewed:
      return "info";
    case DiagnosticStatus.Completed:
      return "success";
    case DiagnosticStatus.Draft:
      return "warning";
  }
}
