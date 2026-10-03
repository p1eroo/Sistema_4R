import {
  ServiceCategory,
  ServiceStatus,
  type ServiceItem,
} from "@/domain/services";
import { asEntityId, money } from "@/domain/shared";

const SEED_CREATED_AT = "2025-03-10T09:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-15T10:00:00.000Z";
const IGV_RATE = 0.18;

type ServiceSeed = {
  id: string;
  code: string;
  name: string;
  category: ServiceCategory;
  estimatedMinutes: number;
  price: number;
  description?: string;
};

function service(seed: ServiceSeed): ServiceItem {
  return {
    id: asEntityId(seed.id),
    code: seed.code,
    name: seed.name,
    category: seed.category,
    estimatedMinutes: seed.estimatedMinutes,
    price: money(seed.price),
    igvRate: IGV_RATE,
    status: ServiceStatus.Active,
    ...(seed.description !== undefined
      ? { description: seed.description }
      : {}),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const serviceSeed: ServiceItem[] = [
  service({
    id: "SRV-0001",
    code: "SRV-001",
    name: "Mantenimiento preventivo",
    category: ServiceCategory.Maintenance,
    estimatedMinutes: 120,
    price: 18000,
    description: "Revisión integral por kilometraje.",
  }),
  service({
    id: "SRV-0002",
    code: "SRV-002",
    name: "Cambio de aceite",
    category: ServiceCategory.Maintenance,
    estimatedMinutes: 60,
    price: 9000,
  }),
  service({
    id: "SRV-0003",
    code: "SRV-003",
    name: "Sistema de frenos",
    category: ServiceCategory.Mechanical,
    estimatedMinutes: 180,
    price: 25000,
    description: "Revisión y cambio de pastillas y discos.",
  }),
  service({
    id: "SRV-0004",
    code: "SRV-004",
    name: "Diagnóstico computarizado",
    category: ServiceCategory.Diagnostics,
    estimatedMinutes: 60,
    price: 12000,
  }),
  service({
    id: "SRV-0005",
    code: "SRV-005",
    name: "Alineamiento y balanceo",
    category: ServiceCategory.Mechanical,
    estimatedMinutes: 90,
    price: 15000,
  }),
  service({
    id: "SRV-0006",
    code: "SRV-006",
    name: "Cambio de embrague",
    category: ServiceCategory.Mechanical,
    estimatedMinutes: 240,
    price: 48000,
  }),
];
