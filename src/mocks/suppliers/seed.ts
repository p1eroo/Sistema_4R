import {
  PaymentTerms,
  SupplierStatus,
  type Supplier,
} from "@/domain/suppliers";
import { asEntityId } from "@/domain/shared";

const SEED_CREATED_AT = "2025-03-15T09:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-15T10:00:00.000Z";

type SupplierSeed = {
  id: string;
  ruc: string;
  businessName: string;
  tradeName: string;
  contactName: string;
  contactRole: string;
  contactPhone: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: PaymentTerms;
};

function supplier(seed: SupplierSeed): Supplier {
  return {
    id: asEntityId(seed.id),
    ruc: seed.ruc,
    businessName: seed.businessName,
    tradeName: seed.tradeName,
    contact: {
      name: seed.contactName,
      role: seed.contactRole,
      phone: seed.contactPhone,
      email: seed.email,
    },
    phone: seed.phone,
    email: seed.email,
    address: seed.address,
    paymentTerms: seed.paymentTerms,
    status: SupplierStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const supplierSeed: Supplier[] = [
  supplier({
    id: "SUP-0001",
    ruc: "20512345678",
    businessName: "Repuestos del Norte SAC",
    tradeName: "Repuestos del Norte",
    contactName: "Ana Salas",
    contactRole: "Ejecutiva de ventas",
    contactPhone: "987111222",
    phone: "014765432",
    email: "ventas@repuestosdelnorte.pe",
    address: "Av. Argentina 2450, Lima",
    paymentTerms: PaymentTerms.Days30,
  }),
  supplier({
    id: "SUP-0002",
    ruc: "20487654321",
    businessName: "Lubricantes Perú SAC",
    tradeName: "Lubricantes Perú",
    contactName: "Jorge Medina",
    contactRole: "Jefe de cuenta",
    contactPhone: "987222333",
    phone: "014765433",
    email: "contacto@lubricantesperu.pe",
    address: "Av. Colonial 1780, Lima",
    paymentTerms: PaymentTerms.Days15,
  }),
  supplier({
    id: "SUP-0003",
    ruc: "20601234567",
    businessName: "Autopartes Andinas EIRL",
    tradeName: "Autopartes Andinas",
    contactName: "Rosa Ttito",
    contactRole: "Ventas",
    contactPhone: "987333444",
    phone: "014765434",
    email: "ventas@autopartesandinas.pe",
    address: "Jr. Paruro 1120, Lima",
    paymentTerms: PaymentTerms.Cash,
  }),
  supplier({
    id: "SUP-0004",
    ruc: "20556677889",
    businessName: "Frenos y Seguridad SAC",
    tradeName: "Frenos y Seguridad",
    contactName: "Carlos Núñez",
    contactRole: "Gerente comercial",
    contactPhone: "987444555",
    phone: "014765435",
    email: "ventas@frenosyseguridad.pe",
    address: "Av. Aviación 3200, San Borja",
    paymentTerms: PaymentTerms.Days45,
  }),
  supplier({
    id: "SUP-0005",
    ruc: "20998877665",
    businessName: "Distribuidora Bosch Perú SAC",
    tradeName: "Bosch Perú",
    contactName: "Elena Prado",
    contactRole: "Ejecutiva",
    contactPhone: "987555666",
    phone: "014765436",
    email: "pedidos@boschperu.pe",
    address: "Av. Javier Prado 4200, Lima",
    paymentTerms: PaymentTerms.Days60,
  }),
  supplier({
    id: "SUP-0006",
    ruc: "20112233445",
    businessName: "Importaciones NGK Perú SAC",
    tradeName: "NGK Perú",
    contactName: "Luis Chávez",
    contactRole: "Ventas",
    contactPhone: "987666777",
    phone: "014765437",
    email: "ventas@ngkperu.pe",
    address: "Av. Los Frutales 560, Ate",
    paymentTerms: PaymentTerms.Days30,
  }),
];
