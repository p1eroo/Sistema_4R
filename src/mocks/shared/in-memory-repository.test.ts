import { beforeEach, describe, expect, it } from "vitest";

import type { EntityId } from "@/domain/shared/ids";
import { asEntityId } from "@/domain/shared/ids";
import {
  createInMemoryRepository,
  RepositoryError,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

type Product = {
  id: EntityId;
  name: string;
  price: number;
};

const seed: Product[] = [
  { id: asEntityId("p-0001"), name: "Filtro de aceite", price: 4500 },
  { id: asEntityId("p-0002"), name: "Pastillas de freno", price: 12000 },
  { id: asEntityId("p-0003"), name: "Aceite 5W-30", price: 8000 },
];

let repo: InMemoryRepository<Product>;

beforeEach(() => {
  repo = createInMemoryRepository<Product>({ seed });
});

describe("createInMemoryRepository", () => {
  it("lists seeded entities as copies", async () => {
    const all = await repo.getAll();

    expect(all).toHaveLength(3);
    expect(all).not.toBe(seed);
    expect(all[0]).not.toBe(seed[0]);
  });

  it("creates entities with deterministic generated ids", async () => {
    const created = await repo.create({ name: "Bujía", price: 3000 });

    expect(created.id).toBe("id-0004");
    expect(await repo.getAll()).toHaveLength(4);
  });

  it("returns copies so external mutation does not leak", async () => {
    const fetched = await repo.getById(asEntityId("p-0001"));
    if (fetched) {
      fetched.name = "mutated";
    }

    const again = await repo.getById(asEntityId("p-0001"));
    expect(again?.name).toBe("Filtro de aceite");
  });

  it("updates without changing the id", async () => {
    const updated = await repo.update(asEntityId("p-0002"), { price: 13000 });

    expect(updated.id).toBe("p-0002");
    expect(updated.price).toBe(13000);
    expect((await repo.getById(asEntityId("p-0002")))?.price).toBe(13000);
  });

  it("removes entities and rejects unknown ids", async () => {
    await repo.remove(asEntityId("p-0003"));

    expect(await repo.getById(asEntityId("p-0003"))).toBeUndefined();
    await expect(repo.remove(asEntityId("p-0003"))).rejects.toBeInstanceOf(
      RepositoryError,
    );
    await expect(
      repo.update(asEntityId("missing"), { price: 1 }),
    ).rejects.toBeInstanceOf(RepositoryError);
  });
});

describe("query", () => {
  it("applies search, sort and pagination", async () => {
    const result = await repo.query({
      query: { search: "aceite", sortBy: "price", pageSize: 1 },
      searchFields: ["name"],
      sortSelectors: { price: (item) => item.price },
    });

    expect(result.items.map((item) => item.name)).toEqual(["Filtro de aceite"]);
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 1,
      total: 2,
      totalPages: 2,
    });
  });

  it("returns everything when no query options are provided", async () => {
    const result = await repo.query();

    expect(result.items).toHaveLength(3);
    expect(result.pagination.total).toBe(3);
  });
});

describe("failure and delay injection", () => {
  it("fails exactly once after failNext", async () => {
    const boom = new Error("fallo simulado");
    repo.failNext(boom);

    await expect(repo.getAll()).rejects.toBe(boom);
    await expect(repo.getAll()).resolves.toHaveLength(3);
  });

  it("supports a configurable delay", async () => {
    repo.setDelay(20);

    const startedAt = Date.now();
    await repo.getAll();

    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(15);
  });
});
