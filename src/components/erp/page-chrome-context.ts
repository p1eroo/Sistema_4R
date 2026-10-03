import { createContext } from "react";

export type PageChrome = {
  title: string;
  breadcrumb: string;
};

export type PageChromeContextValue = {
  override: PageChrome | null;
  setOverride: (value: PageChrome | null) => void;
};

export const PageChromeContext = createContext<PageChromeContextValue | null>(
  null,
);
