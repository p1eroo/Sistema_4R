import type { BranchRef, DateTimeIso, EntityId } from "@/domain/shared";

export enum CustomerType {
  Persona = "persona",
  Empresa = "empresa",
}

export enum DocumentType {
  DNI = "DNI",
  RUC = "RUC",
  CE = "CE",
}

export enum CustomerStatus {
  Active = "active",
  Inactive = "inactive",
  Archived = "archived",
}

export type CustomerPhone = {
  readonly label: string;
  readonly number: string;
};

export type CustomerAddress = {
  readonly line1: string;
  readonly district?: string | undefined;
  readonly city?: string | undefined;
  readonly region?: string | undefined;
};

export type Customer = {
  readonly id: EntityId;
  readonly type: CustomerType;
  readonly documentType: DocumentType;
  readonly documentNumber: string;
  readonly displayName: string;
  readonly firstName?: string | undefined;
  readonly lastName?: string | undefined;
  readonly businessName?: string | undefined;
  readonly phones: readonly CustomerPhone[];
  readonly email?: string | undefined;
  readonly address?: CustomerAddress | undefined;
  readonly preferredBranch?: BranchRef | undefined;
  readonly notes?: string | undefined;
  readonly status: CustomerStatus;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type CustomerListItem = {
  readonly id: EntityId;
  readonly displayName: string;
  readonly type: CustomerType;
  readonly documentType: DocumentType;
  readonly documentNumber: string;
  readonly phone?: string | undefined;
  readonly email?: string | undefined;
  readonly preferredBranchName?: string | undefined;
  readonly status: CustomerStatus;
};

export type CustomerNameParts = {
  readonly type: CustomerType;
  readonly businessName?: string | undefined;
  readonly firstName?: string | undefined;
  readonly lastName?: string | undefined;
};

export function customerDisplayName(input: CustomerNameParts): string {
  if (input.type === CustomerType.Empresa) {
    const businessName = input.businessName?.trim();
    return businessName && businessName.length > 0
      ? businessName
      : "Empresa sin nombre";
  }

  const parts = [input.firstName, input.lastName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .map((part) => part.trim());

  return parts.length > 0 ? parts.join(" ") : "Cliente sin nombre";
}
