import { DeliveryStatus } from "@/domain/workshop-ops";

export function deliveryStatusVariant(
  status: DeliveryStatus,
): "info" | "success" | "warning" | "neutral" | "danger" {
  switch (status) {
    case DeliveryStatus.Scheduled:
      return "info";
    case DeliveryStatus.Ready:
      return "warning";
    case DeliveryStatus.Delivered:
      return "success";
    case DeliveryStatus.Cancelled:
      return "danger";
  }
}

export const DASHBOARD_DELIVERY_NOTES: Record<string, string> = {
  "ABC-123": "Control final",
  "F6T-884": "Lavado",
  "B4X-521": "Prueba de ruta",
};
