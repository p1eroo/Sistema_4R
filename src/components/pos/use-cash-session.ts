import { useQuery } from "@tanstack/react-query";

import { cashService } from "@/mocks/cash/service";

const DEFAULT_BRANCH_SLUG = "molina";

export function useCashSession(branchSlug = DEFAULT_BRANCH_SLUG) {
  return useQuery({
    queryKey: ["cash", "current", branchSlug],
    queryFn: () => cashService.getCurrent(branchSlug),
  });
}
