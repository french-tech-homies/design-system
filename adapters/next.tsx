"use client";

/* =============================================================================
   Next.js adapter — OPTIONAL
   -----------------------------------------------------------------------------
   The kit itself imports nothing from Next.js. This file is the only place that
   does, so a non-Next consumer can simply delete it.
   ========================================================================== */

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";
import type { ImageRenderer } from "../components/Card";

declare module "react-aria-components" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

/**
 * Wires React Aria's client-side navigation (links in Menu, Tab, GridList…) to
 * the Next router. Mount once, above the components.
 */
export function AriaRouterProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <RouterProvider navigate={(path, options) => router.push(path, options)}>
      {children}
    </RouterProvider>
  );
}

/**
 * Renders `CardContent`'s string `media` through `next/image` instead of a
 * plain `<img>`:
 *
 *   <CardContent media={url} renderImage={nextImageRenderer} />
 */
export const nextImageRenderer: ImageRenderer = ({
  src,
  alt,
  fill,
  className,
}) =>
  fill ? (
    <Image src={src} alt={alt} fill className={className} />
  ) : (
    <Image src={src} alt={alt} width={1200} height={630} className={className} />
  );
