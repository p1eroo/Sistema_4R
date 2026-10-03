import type { Branch } from "@/domain/branches";
import { asEntityId, BranchStatus } from "@/domain/shared";

const SEED_CREATED_AT = "2025-01-01T09:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-15T10:00:00.000Z";

export const branchSeed: Branch[] = [
  {
    id: asEntityId("BR-LM"),
    slug: "molina",
    name: "Sede La Molina",
    address: "Av. Raúl Ferrero 1234, La Molina",
    phone: "014765100",
    status: BranchStatus.Active,
    isDefault: true,
    capacity: 24,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("BR-SU"),
    slug: "surco",
    name: "Sede Surco",
    address: "Av. Caminos del Inca 2450, Surco",
    phone: "014765200",
    status: BranchStatus.Active,
    isDefault: false,
    capacity: 16,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("BR-SM"),
    slug: "san-miguel",
    name: "Sede San Miguel",
    address: "Av. La Marina 2350, San Miguel",
    phone: "014765300",
    status: BranchStatus.Active,
    isDefault: false,
    capacity: 8,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
];
