import {
  PERMISSIONS,
  UserStatus,
  type Permission,
  type Role,
  type User,
} from "@/domain/identity";
import { asEntityId } from "@/domain/shared";

const SEED_CREATED_AT = "2025-01-02T09:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-15T10:00:00.000Z";

const ALL: readonly Permission[] = [...PERMISSIONS];

export const roleSeed: Role[] = [
  {
    id: asEntityId("ROLE-0001"),
    code: "admin",
    name: "Administrador",
    description: "Acceso total al sistema.",
    permissions: ALL,
  },
  {
    id: asEntityId("ROLE-0002"),
    code: "advisor",
    name: "Asesor de servicio",
    description: "Gestiona recepción, clientes y seguimiento.",
    permissions: [
      "workshop.view",
      "workshop.manage",
      "customers.view",
      "customers.manage",
      "reports.view",
      "users.view",
    ],
  },
  {
    id: asEntityId("ROLE-0003"),
    code: "technician",
    name: "Técnico",
    description: "Trabaja órdenes y consulta inventario.",
    permissions: ["workshop.view", "workshop.manage", "inventory.view"],
  },
  {
    id: asEntityId("ROLE-0004"),
    code: "cashier",
    name: "Cajero",
    description: "Cobra en POS y consulta clientes.",
    permissions: ["pos.view", "pos.sell", "customers.view", "inventory.view"],
  },
  {
    id: asEntityId("ROLE-0005"),
    code: "viewer",
    name: "Consulta",
    description: "Solo lectura de módulos operativos.",
    permissions: [
      "workshop.view",
      "inventory.view",
      "customers.view",
      "reports.view",
    ],
  },
];

type UserSeed = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  roleIds: string[];
  branchIds: string[];
  status?: UserStatus;
};

function user(seed: UserSeed): User {
  return {
    id: asEntityId(seed.id),
    fullName: seed.fullName,
    email: seed.email,
    ...(seed.phone !== undefined ? { phone: seed.phone } : {}),
    roleIds: seed.roleIds.map(asEntityId),
    branchIds: seed.branchIds.map(asEntityId),
    status: seed.status ?? UserStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const userSeed: User[] = [
  user({
    id: "USR-0001",
    fullName: "Carlos Mendoza",
    email: "carlos.mendoza@4ruedas.pe",
    phone: "987650001",
    roleIds: ["ROLE-0001"],
    branchIds: ["BR-LM"],
  }),
  user({
    id: "USR-0002",
    fullName: "Ana Salas",
    email: "ana.salas@4ruedas.pe",
    phone: "987650002",
    roleIds: ["ROLE-0002"],
    branchIds: ["BR-SU"],
  }),
  user({
    id: "USR-0003",
    fullName: "Luis Chávez",
    email: "luis.chavez@4ruedas.pe",
    phone: "987650003",
    roleIds: ["ROLE-0003"],
    branchIds: ["BR-LM", "BR-SU"],
  }),
  user({
    id: "USR-0004",
    fullName: "Elena Prado",
    email: "elena.prado@4ruedas.pe",
    phone: "987650004",
    roleIds: ["ROLE-0004"],
    branchIds: ["BR-LM"],
  }),
  user({
    id: "USR-0005",
    fullName: "Rosa Ttito",
    email: "rosa.ttito@4ruedas.pe",
    roleIds: ["ROLE-0005"],
    branchIds: ["BR-SM"],
  }),
  user({
    id: "TEC-0001",
    fullName: "Marco Quispe",
    email: "marco.quispe@4ruedas.pe",
    phone: "987650005",
    roleIds: ["ROLE-0003"],
    branchIds: ["BR-LM"],
  }),
  user({
    id: "TEC-0002",
    fullName: "Iván Rojas",
    email: "ivan.rojas@4ruedas.pe",
    phone: "987650006",
    roleIds: ["ROLE-0003"],
    branchIds: ["BR-SU"],
  }),
  user({
    id: "TEC-0003",
    fullName: "Paola Flores",
    email: "paola.flores@4ruedas.pe",
    phone: "987650007",
    roleIds: ["ROLE-0003"],
    branchIds: ["BR-SM"],
  }),
];
