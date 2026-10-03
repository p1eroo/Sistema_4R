import {
  CustomerStatus,
  CustomerType,
  DocumentType,
  customerDisplayName,
  type Customer,
  type CustomerAddress,
  type CustomerPhone,
} from "@/domain/customers";
import { asEntityId, type BranchRef } from "@/domain/shared";

const LA_MOLINA: BranchRef = {
  id: asEntityId("BR-LM"),
  name: "Sede La Molina",
};
const SURCO: BranchRef = { id: asEntityId("BR-SU"), name: "Sede Surco" };
const SAN_MIGUEL: BranchRef = {
  id: asEntityId("BR-SM"),
  name: "Sede San Miguel",
};

const SEED_CREATED_AT = "2025-03-01T09:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-10T15:30:00.000Z";

type PersonSeed = {
  id: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: CustomerAddress;
  preferredBranch: BranchRef;
  notes?: string;
};

function person(seed: PersonSeed): Customer {
  const phone: CustomerPhone = { label: "Móvil", number: seed.phone };

  return {
    id: asEntityId(seed.id),
    type: CustomerType.Persona,
    documentType: DocumentType.DNI,
    documentNumber: seed.documentNumber,
    displayName: customerDisplayName({
      type: CustomerType.Persona,
      firstName: seed.firstName,
      lastName: seed.lastName,
    }),
    firstName: seed.firstName,
    lastName: seed.lastName,
    phones: [phone],
    ...(seed.email !== undefined ? { email: seed.email } : {}),
    ...(seed.address !== undefined ? { address: seed.address } : {}),
    preferredBranch: seed.preferredBranch,
    ...(seed.notes !== undefined ? { notes: seed.notes } : {}),
    status: CustomerStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

type CompanySeed = {
  id: string;
  documentNumber: string;
  businessName: string;
  phone: string;
  email?: string;
  address?: CustomerAddress;
  preferredBranch: BranchRef;
  notes?: string;
};

function company(seed: CompanySeed): Customer {
  const phone: CustomerPhone = { label: "Central", number: seed.phone };

  return {
    id: asEntityId(seed.id),
    type: CustomerType.Empresa,
    documentType: DocumentType.RUC,
    documentNumber: seed.documentNumber,
    displayName: customerDisplayName({
      type: CustomerType.Empresa,
      businessName: seed.businessName,
    }),
    businessName: seed.businessName,
    phones: [phone],
    ...(seed.email !== undefined ? { email: seed.email } : {}),
    ...(seed.address !== undefined ? { address: seed.address } : {}),
    preferredBranch: seed.preferredBranch,
    ...(seed.notes !== undefined ? { notes: seed.notes } : {}),
    status: CustomerStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const customerSeed: Customer[] = [
  person({
    id: "CUS-0001",
    documentNumber: "45678912",
    firstName: "Lucía",
    lastName: "Ramos",
    phone: "987654321",
    email: "lucia.ramos@correo.pe",
    address: {
      line1: "Av. Los Álamos 345",
      district: "La Molina",
      city: "Lima",
      region: "Lima",
    },
    preferredBranch: LA_MOLINA,
  }),
  person({
    id: "CUS-0002",
    documentNumber: "41234567",
    firstName: "Ana",
    lastName: "Torres",
    phone: "987654322",
    email: "ana.torres@correo.pe",
    address: {
      line1: "Calle Monte Real 128",
      district: "Santiago de Surco",
      city: "Lima",
      region: "Lima",
    },
    preferredBranch: SURCO,
  }),
  person({
    id: "CUS-0003",
    documentNumber: "44556677",
    firstName: "Luis",
    lastName: "Paredes",
    phone: "987654323",
    email: "luis.paredes@correo.pe",
    address: {
      line1: "Av. Raúl Ferrero 890",
      district: "La Molina",
      city: "Lima",
      region: "Lima",
    },
    preferredBranch: LA_MOLINA,
    notes: "Cliente frecuente de mantenimiento preventivo.",
  }),
  person({
    id: "CUS-0004",
    documentNumber: "47889900",
    firstName: "Rosa",
    lastName: "Huamán",
    phone: "987654324",
    email: "rosa.huaman@correo.pe",
    address: {
      line1: "Av. Universitaria 1500",
      district: "San Miguel",
      city: "Lima",
      region: "Lima",
    },
    preferredBranch: SAN_MIGUEL,
  }),
  person({
    id: "CUS-0005",
    documentNumber: "40998877",
    firstName: "Jorge",
    lastName: "Salazar",
    phone: "987654325",
    email: "jorge.salazar@correo.pe",
    preferredBranch: SURCO,
  }),
  person({
    id: "CUS-0006",
    documentNumber: "43221100",
    firstName: "María",
    lastName: "Quispe",
    phone: "987654326",
    email: "maria.quispe@correo.pe",
    preferredBranch: SAN_MIGUEL,
  }),
  person({
    id: "CUS-0007",
    documentNumber: "45512398",
    firstName: "Carlos",
    lastName: "Rentería",
    phone: "987654327",
    email: "carlos.renteria@correo.pe",
    preferredBranch: LA_MOLINA,
  }),
  person({
    id: "CUS-0008",
    documentNumber: "47123890",
    firstName: "Elena",
    lastName: "Vargas",
    phone: "987654328",
    email: "elena.vargas@correo.pe",
    preferredBranch: SURCO,
  }),
  person({
    id: "CUS-0009",
    documentNumber: "42345678",
    firstName: "Pedro",
    lastName: "Cárdenas",
    phone: "987654329",
    email: "pedro.cardenas@correo.pe",
    preferredBranch: LA_MOLINA,
  }),
  company({
    id: "CUS-0010",
    documentNumber: "20512345678",
    businessName: "Taller El Sol SAC",
    phone: "987654330",
    email: "contacto@tallerelsol.pe",
    address: {
      line1: "Av. La Fontana 780",
      district: "La Molina",
      city: "Lima",
      region: "Lima",
    },
    preferredBranch: LA_MOLINA,
  }),
  company({
    id: "CUS-0011",
    documentNumber: "20487654321",
    businessName: "Transportes Cruz del Sur SAC",
    phone: "987654331",
    email: "logistica@cruzdelsur.pe",
    preferredBranch: SURCO,
    notes: "Flota con mantenimiento programado mensual.",
  }),
  company({
    id: "CUS-0012",
    documentNumber: "20601234567",
    businessName: "Distribuidora Andina EIRL",
    phone: "987654332",
    email: "ventas@distribuidoraandina.pe",
    preferredBranch: SAN_MIGUEL,
  }),
];
