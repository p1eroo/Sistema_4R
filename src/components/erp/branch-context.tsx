import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";

import type { Branch } from "@/domain/branches";
import { branchService } from "@/mocks/branches/service";

const STORAGE_KEY = "4r-active-branch-id";

type BranchContextValue = {
  branches: readonly Branch[];
  activeBranch: Branch | undefined;
  isLoading: boolean;
  setActiveBranchId: (id: string) => void;
};

const BranchContext = createContext<BranchContextValue | null>(null);

export function BranchProvider({ children }: { children: ReactNode }) {
  const branchesQuery = useQuery({
    queryKey: ["branches", "list"],
    queryFn: () => branchService.list({ pageSize: 100 }),
  });

  const branches = branchesQuery.data?.items ?? [];

  const [activeBranchId, setActiveBranchIdState] = useState<string | null>(
    () => {
      if (typeof window === "undefined") {
        return null;
      }
      return window.sessionStorage.getItem(STORAGE_KEY);
    },
  );

  const setActiveBranchId = useCallback((id: string) => {
    setActiveBranchIdState(id);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const activeBranch = useMemo(() => {
    if (branches.length === 0) {
      return undefined;
    }
    if (activeBranchId) {
      const selected = branches.find((branch) => branch.id === activeBranchId);
      if (selected) {
        return selected;
      }
    }
    return branches.find((branch) => branch.isDefault) ?? branches[0];
  }, [activeBranchId, branches]);

  const value = useMemo(
    () => ({
      branches,
      activeBranch,
      isLoading: branchesQuery.isLoading,
      setActiveBranchId,
    }),
    [activeBranch, branches, branchesQuery.isLoading, setActiveBranchId],
  );

  return (
    <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
  );
}

export function useActiveBranch(): BranchContextValue {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useActiveBranch debe usarse dentro de BranchProvider.");
  }
  return context;
}
