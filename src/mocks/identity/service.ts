import {
  UserStatus,
  type Permission,
  type Role,
  type User,
} from "@/domain/identity";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { roleSeed, userSeed } from "@/mocks/identity/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class IdentityNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el registro de identidad ${id}.`);
    this.name = "IdentityNotFoundError";
  }
}

export class IdentityValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos de identidad no son válidos.");
    this.name = "IdentityValidationError";
    this.issues = issues;
  }
}

export type UserInput = Omit<User, "id" | "createdAt" | "updatedAt">;

export type IdentityService = {
  listUsers(query?: ListQuery): Promise<ListResult<User>>;
  getUserById(id: EntityId): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  listRoles(): Promise<readonly Role[]>;
  getRoleById(id: EntityId): Promise<Role | undefined>;
  getRoleByCode(code: string): Promise<Role | undefined>;
  createUser(input: UserInput): Promise<User>;
  updateUser(id: EntityId, input: Partial<UserInput>): Promise<User>;
  archiveUser(id: EntityId): Promise<User>;
  setRolePermission(
    roleId: EntityId,
    permission: Permission,
    enabled: boolean,
  ): Promise<Role>;
};

const SORT_SELECTORS = {
  fullName: (user: User) => user.fullName,
  email: (user: User) => user.email,
  status: (user: User) => user.status,
};

function buildUserPatch(
  values: Partial<UserInput>,
  now: DateTimeIso,
): Partial<Omit<User, "id">> {
  return {
    ...(values.fullName !== undefined ? { fullName: values.fullName } : {}),
    ...(values.email !== undefined ? { email: values.email } : {}),
    ...(values.phone !== undefined ? { phone: values.phone } : {}),
    ...(values.roleIds !== undefined ? { roleIds: values.roleIds } : {}),
    ...(values.branchIds !== undefined ? { branchIds: values.branchIds } : {}),
    ...(values.status !== undefined ? { status: values.status } : {}),
    updatedAt: now,
  };
}

export function createIdentityService(
  userRepository: InMemoryRepository<User> = createInMemoryRepository<User>({
    seed: userSeed,
    idPrefix: "USR",
  }),
  roleRepository: InMemoryRepository<Role> = createInMemoryRepository<Role>({
    seed: roleSeed,
    idPrefix: "ROLE",
  }),
): IdentityService {
  async function findByEmail(email: string): Promise<User | undefined> {
    const normalized = email.trim().toLowerCase();
    const all = await userRepository.getAll();
    return all.find((user) => user.email.toLowerCase() === normalized);
  }

  async function assertEmailAvailable(
    email: string,
    ignoreId?: EntityId,
  ): Promise<void> {
    const conflict = await findByEmail(email);
    if (conflict && conflict.id !== ignoreId) {
      throw new IdentityValidationError([
        `Ya existe un usuario con el correo ${email}.`,
      ]);
    }
  }

  return {
    listUsers(query: ListQuery = {}) {
      return userRepository.query({
        query,
        searchFields: ["fullName", "email"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    getUserById(id: EntityId) {
      return userRepository.getById(id);
    },

    getUserByEmail(email: string) {
      return findByEmail(email);
    },

    listRoles() {
      return roleRepository.getAll();
    },

    getRoleById(id: EntityId) {
      return roleRepository.getById(id);
    },

    async getRoleByCode(code: string) {
      const normalized = code.trim().toLowerCase();
      const all = await roleRepository.getAll();
      return all.find((role) => role.code.toLowerCase() === normalized);
    },

    async createUser(input: UserInput) {
      await assertEmailAvailable(input.email);
      const now = nowIso();

      return userRepository.create({
        ...input,
        createdAt: now,
        updatedAt: now,
      });
    },

    async updateUser(id: EntityId, input: Partial<UserInput>) {
      const current = await userRepository.getById(id);
      if (!current) {
        throw new IdentityNotFoundError(id);
      }
      if (input.email !== undefined) {
        await assertEmailAvailable(input.email, id);
      }

      return userRepository.update(id, buildUserPatch(input, nowIso()));
    },

    async archiveUser(id: EntityId) {
      const current = await userRepository.getById(id);
      if (!current) {
        throw new IdentityNotFoundError(id);
      }

      return userRepository.update(id, {
        status: UserStatus.Inactive,
        updatedAt: nowIso(),
      });
    },

    async setRolePermission(roleId, permission, enabled) {
      const current = await roleRepository.getById(roleId);
      if (!current) {
        throw new IdentityNotFoundError(roleId);
      }

      const next = new Set(current.permissions);
      if (enabled) {
        next.add(permission);
      } else {
        next.delete(permission);
      }

      return roleRepository.update(roleId, {
        permissions: [...next].sort(),
      });
    },
  };
}

export const identityService: IdentityService = createIdentityService();
