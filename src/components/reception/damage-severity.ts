import { DamageSeverity } from "@/domain/inspections";

export const SEVERITY_TOKEN: Record<
  DamageSeverity,
  {
    readonly swatch: string;
    readonly fill: string;
    readonly token: "success" | "warning" | "danger";
  }
> = {
  [DamageSeverity.Minor]: {
    swatch: "bg-success",
    fill: "fill-success",
    token: "success",
  },
  [DamageSeverity.Moderate]: {
    swatch: "bg-warning",
    fill: "fill-warning",
    token: "warning",
  },
  [DamageSeverity.Severe]: {
    swatch: "bg-destructive",
    fill: "fill-destructive",
    token: "danger",
  },
};
