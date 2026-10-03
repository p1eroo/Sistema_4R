import { asEntityId, type BranchRef } from "@/domain/shared";
import { FuelType, VehicleStatus, type Vehicle } from "@/domain/vehicles";

const LA_MOLINA: BranchRef = {
  id: asEntityId("BR-LM"),
  name: "Sede La Molina",
};
const SURCO: BranchRef = { id: asEntityId("BR-SU"), name: "Sede Surco" };
const SAN_MIGUEL: BranchRef = {
  id: asEntityId("BR-SM"),
  name: "Sede San Miguel",
};

const SEED_CREATED_AT = "2025-03-05T10:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-12T11:15:00.000Z";

type VehicleSeed = {
  id: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuelType: FuelType;
  odometerKm: number;
  vin?: string;
  usualBranch: BranchRef;
  notes?: string;
};

function vehicle(seed: VehicleSeed): Vehicle {
  return {
    id: asEntityId(seed.id),
    customerId: asEntityId(seed.customerId),
    plate: seed.plate,
    brand: seed.brand,
    model: seed.model,
    year: seed.year,
    color: seed.color,
    fuelType: seed.fuelType,
    odometerKm: seed.odometerKm,
    ...(seed.vin !== undefined ? { vin: seed.vin } : {}),
    usualBranch: seed.usualBranch,
    status: VehicleStatus.Active,
    ...(seed.notes !== undefined ? { notes: seed.notes } : {}),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const vehicleSeed: Vehicle[] = [
  vehicle({
    id: "VEH-0001",
    customerId: "CUS-0001",
    plate: "ABC-123",
    brand: "Toyota",
    model: "Corolla",
    year: 2021,
    color: "Blanco",
    fuelType: FuelType.Gasolina,
    odometerKm: 48250,
    vin: "8AJBA3CD0J1234567",
    usualBranch: LA_MOLINA,
  }),
  vehicle({
    id: "VEH-0002",
    customerId: "CUS-0007",
    plate: "F6T-884",
    brand: "Hyundai",
    model: "Tucson",
    year: 2022,
    color: "Gris",
    fuelType: FuelType.Gasolina,
    odometerKm: 31540,
    vin: "KMHJ3815DNU123456",
    usualBranch: LA_MOLINA,
  }),
  vehicle({
    id: "VEH-0003",
    customerId: "CUS-0005",
    plate: "B4X-521",
    brand: "Kia",
    model: "Sportage",
    year: 2023,
    color: "Azul",
    fuelType: FuelType.Gasolina,
    odometerKm: 18900,
    usualBranch: SURCO,
  }),
  vehicle({
    id: "VEH-0004",
    customerId: "CUS-0002",
    plate: "A2B-441",
    brand: "Toyota",
    model: "Yaris",
    year: 2020,
    color: "Rojo",
    fuelType: FuelType.Gasolina,
    odometerKm: 62310,
    usualBranch: SURCO,
  }),
  vehicle({
    id: "VEH-0005",
    customerId: "CUS-0003",
    plate: "C3D-672",
    brand: "Nissan",
    model: "Versa",
    year: 2019,
    color: "Plata",
    fuelType: FuelType.Gasolina,
    odometerKm: 74880,
    usualBranch: LA_MOLINA,
  }),
  vehicle({
    id: "VEH-0006",
    customerId: "CUS-0004",
    plate: "E4F-813",
    brand: "Suzuki",
    model: "Swift",
    year: 2021,
    color: "Blanco",
    fuelType: FuelType.Gasolina,
    odometerKm: 40220,
    usualBranch: SAN_MIGUEL,
  }),
  vehicle({
    id: "VEH-0007",
    customerId: "CUS-0006",
    plate: "G5H-290",
    brand: "Hyundai",
    model: "Accent",
    year: 2018,
    color: "Negro",
    fuelType: FuelType.Gasolina,
    odometerKm: 91050,
    usualBranch: SAN_MIGUEL,
  }),
  vehicle({
    id: "VEH-0008",
    customerId: "CUS-0009",
    plate: "J6K-358",
    brand: "Kia",
    model: "Rio",
    year: 2017,
    color: "Rojo",
    fuelType: FuelType.Gasolina,
    odometerKm: 103400,
    usualBranch: LA_MOLINA,
  }),
  vehicle({
    id: "VEH-0009",
    customerId: "CUS-0010",
    plate: "L7M-904",
    brand: "Toyota",
    model: "Hilux",
    year: 2022,
    color: "Blanco",
    fuelType: FuelType.Diesel,
    odometerKm: 55600,
    usualBranch: LA_MOLINA,
    notes: "Unidad de reparto de la empresa.",
  }),
  vehicle({
    id: "VEH-0010",
    customerId: "CUS-0011",
    plate: "N8P-126",
    brand: "Nissan",
    model: "Frontier",
    year: 2020,
    color: "Plata",
    fuelType: FuelType.Diesel,
    odometerKm: 88230,
    usualBranch: SURCO,
    notes: "Flota con mantenimiento programado.",
  }),
  vehicle({
    id: "VEH-0011",
    customerId: "CUS-0012",
    plate: "Q9R-537",
    brand: "Hyundai",
    model: "H1",
    year: 2019,
    color: "Blanco",
    fuelType: FuelType.Diesel,
    odometerKm: 96410,
    usualBranch: SAN_MIGUEL,
  }),
  vehicle({
    id: "VEH-0012",
    customerId: "CUS-0008",
    plate: "S1T-648",
    brand: "Volkswagen",
    model: "Gol",
    year: 2016,
    color: "Azul",
    fuelType: FuelType.Gasolina,
    odometerKm: 118760,
    usualBranch: SURCO,
  }),
];
