import type { ComponentProps } from "react";

import {
  surfaceClass,
  type SurfaceLevel,
} from "@/components/erp/surface-class";
import { cn } from "@/lib/utils";

/**
 * Superficie Glass del ERP (CONVENTIONS.md §0).
 * - `default`: tarjetas y bloques.
 * - `strong`: contenido denso (tablas, formularios, paneles).
 * - `subtle`: superficies secundarias dentro de otra superficie.
 *
 * Ya trae fondo, borde, radio, sombra y desenfoque: no añadir `border`,
 * `bg-card` ni `shadow-*` en `className`.
 */
export function Surface({
  level = "default",
  as: Tag = "div",
  className,
  ...props
}: ComponentProps<"div"> & {
  level?: SurfaceLevel;
  as?: "div" | "section" | "aside" | "article";
}) {
  return (
    <Tag className={cn("min-w-0", surfaceClass(level), className)} {...props} />
  );
}
