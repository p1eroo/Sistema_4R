import { useContext, useEffect } from "react";

import {
  PageChromeContext,
  type PageChrome,
} from "@/components/erp/page-chrome-context";

export function usePageChromeOverride() {
  return useContext(PageChromeContext);
}

export function useRegisterPageChrome(chrome: PageChrome) {
  const setOverride = useContext(PageChromeContext)?.setOverride;
  const title = chrome.title;
  const breadcrumb = chrome.breadcrumb;

  useEffect(() => {
    setOverride?.({ title, breadcrumb });
    return () => setOverride?.(null);
  }, [breadcrumb, setOverride, title]);
}
