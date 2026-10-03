export type SurfaceLevel = "default" | "strong" | "subtle";

const LEVEL_CLASS: Record<SurfaceLevel, string> = {
  default: "glass",
  strong: "glass-strong",
  subtle: "glass-subtle",
};

/** Clase de vidrio para un nivel, para casos donde no se puede usar `Surface`. */
export function surfaceClass(level: SurfaceLevel = "default"): string {
  return LEVEL_CLASS[level];
}
