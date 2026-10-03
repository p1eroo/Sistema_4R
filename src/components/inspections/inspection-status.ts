import { InspectionStatus } from "@/domain/inspections";

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  [InspectionStatus.Pending]: "Pendiente",
  [InspectionStatus.InProgress]: "En curso",
  [InspectionStatus.Completed]: "Completada",
};

export function inspectionStatusVariant(
  status: InspectionStatus,
): "info" | "success" | "warning" | "neutral" {
  switch (status) {
    case InspectionStatus.Completed:
      return "success";
    case InspectionStatus.InProgress:
      return "info";
    case InspectionStatus.Pending:
      return "warning";
  }
}
