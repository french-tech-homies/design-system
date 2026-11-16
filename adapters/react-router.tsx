"use client";

/* =============================================================================
   React Router adapter — OPTIONAL
   -----------------------------------------------------------------------------
   The kit itself imports nothing from a router. This file is the only place
   that imports `react-router`, so a consumer on another router can delete it
   and write the same few lines against their own navigate function.

   Without it, React Aria's links — `Button href`, `IconButton href`,
   `Chip href`, `Menu` item `href`, `ListItem href` — still render a real
   `<a>`, but a click does a full page load instead of a client-side
   navigation.

   Typing `routerOptions`: React Aria takes the type of the second argument
   from a module augmentation of `RouterConfig`, and TypeScript allows exactly
   one such augmentation per program. The kit ships two adapters, so the
   augmentation cannot live in both — it lives in `adapters/next.tsx`, which
   this repo's own app uses. Delete that file (you are not on Next.js) and put
   this in a `.d.ts` of your own to get `routerOptions={{ replace: true }}`
   typed on every kit link:

     import type { NavigateOptions } from "react-router";
     declare module "react-aria-components" {
       interface RouterConfig {
         routerOptions: NavigateOptions;
       }
     }

   Until then `routerOptions` is untyped, which is the only reason the
   `navigate` callback below casts.
   ========================================================================== */

import React from "react";
import {
  useHref,
  useLocation,
  useNavigate,
  type NavigateOptions,
} from "react-router";
import { RouterProvider } from "react-aria-components";

/**
 * Wires React Aria's client-side navigation to React Router. Mount once,
 * inside the router and above the components:
 *
 *   <RouterProvider router={router}>
 *     <AriaRouterProvider>…</AriaRouterProvider>
 *   </RouterProvider>
 *
 * `useHref` is what makes an app mounted under a basename produce correct
 * `href`s.
 *
 * A link to a fragment (`href="#pricing"`, `href="/#pricing"`) scrolls to the
 * element with that id, as the browser does for a link it follows itself: a
 * client-side navigation sets the address and moves nothing. The element's
 * `scroll-margin-top` is honoured, for a page with a header that sticks. The
 * focus is not moved: move it yourself where the target should take it. TanStack Router is the same shape: swap the two hooks for
 * `useRouter().buildLocation` / `useRouter().navigate`.
 */
/** After a navigation that names a fragment, brings its element into view. */
function ScrollToFragment() {
  const { hash, key } = useLocation();
  React.useEffect(() => {
    if (!hash) return;
    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    document.getElementById(id)?.scrollIntoView();
  }, [hash, key]);
  return null;
}

/** React Router's `useHref` makes every address a path of the app, a
    `mailto:` or an `https:` one too, and the link then leads nowhere. An
    address with a scheme, or one that starts with `//`, is left as it is. */
function useAppHref(to: string) {
  const href = useHref(to);
  return /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(to) ? to : href;
}

export function AriaRouterProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <RouterProvider
      navigate={(path, options) =>
        void navigate(path, options as NavigateOptions | undefined)
      }
      useHref={useAppHref}
    >
      <ScrollToFragment />
      {children}
    </RouterProvider>
  );
}
