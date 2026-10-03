declare const entityIdBrand: unique symbol;

export type EntityId = string & { readonly [entityIdBrand]: "EntityId" };

export function asEntityId(value: string): EntityId {
  return value as EntityId;
}

export function isEntityId(value: unknown): value is EntityId {
  return typeof value === "string" && value.trim().length > 0;
}
