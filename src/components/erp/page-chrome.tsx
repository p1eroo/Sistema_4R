import { useMemo, useState, type ReactNode } from "react";

import {
  PageChromeContext,
  type PageChrome,
} from "@/components/erp/page-chrome-context";

export function PageChromeProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<PageChrome | null>(null);
  const value = useMemo(() => ({ override, setOverride }), [override]);

  return (
    <PageChromeContext.Provider value={value}>
      {children}
    </PageChromeContext.Provider>
  );
}
