"use client";

/**
 * AppShell: an application's frame, with the navigation that fits its width.
 *
 * A block of the MD3 kit: it is copied into your project to be edited. It is
 * yours from then on: an update of the kit does not touch it. It is built
 * from the kit's `BottomNavigation`, `NavigationRail` and `Link`.
 *
 *   <AppShell
 *     items={[
 *       { id: "home", label: "Home", icon: HomeIcon, href: "/" },
 *       { id: "orders", label: "Orders", icon: ReceiptIcon, href: "/orders", badge: 3 },
 *       { id: "settings", label: "Settings", icon: SettingsIcon, href: "/settings" },
 *     ]}
 *     selectedKey={current}
 *     onSelectionChange={setCurrent}
 *     topBar={<TopAppBar title="Orders" />}
 *   >
 *     …the page…
 *   </AppShell>
 *
 * Material gives one set of destinations three forms by window size class
 * (https://m3.material.io/foundations/layout/applying-layout/window-size-classes):
 *
 * - compact, under 600dp: the navigation bar, under the content;
 * - medium and expanded, from 600dp: the navigation rail, beside it;
 * - large, from 1200dp: the rail expanded, its labels beside its icons.
 *
 * The kit has the three components and nothing that chooses between them:
 * this does. All three are rendered and the stylesheet shows one, so the
 * right one is there on the first paint, with no script and nothing to
 * flash on a server-rendered page. It goes by its own width (a container
 * query), not the window's, so it is right inside a preview or a split view.
 *
 * It fills what holds it (`h-full`): give the page's root a height
 * (`h-dvh`). The content scrolls inside `main`, which a skip link, the
 * first thing a keyboard reaches, moves the focus to. Three to five
 * destinations: the navigation bar takes no more.
 *
 * Yours to change: a drawer in place of the expanded rail, a FAB in the
 * rail's `header`, an account button in its `footer`, other widths.
 *
 * Neither Material 3 nor React Aria describes this part.
 */
import {
  BottomNavigation,
  Link,
  NavigationRail,
  type NavigationItem,
} from "@/registry/ds/ui/ds";
import type { ReactNode } from "react";

export type AppShellProps = {
  /** Three to five destinations, the same in every form. */
  items: NavigationItem[];
  /** The id of the destination being shown. */
  selectedKey?: string | null;
  onSelectionChange?: (key: string) => void;
  /** Above the content, beside the rail: the page's top app bar. */
  topBar?: ReactNode;
  /** Above the rail's destinations: a menu button, a FAB. */
  railHeader?: ReactNode;
  /** Pinned under the rail's destinations: an account button. */
  railFooter?: ReactNode;
  /** The name of the navigation landmark. */
  navLabel?: string;
  /** The skip link's text. */
  skipLabel?: string;
  children: ReactNode;
  className?: string;
};

const MAIN_ID = "app-shell-main";

export function AppShell({
  items,
  selectedKey,
  onSelectionChange,
  topBar,
  railHeader,
  railFooter,
  navLabel = "Main",
  skipLabel = "Skip to content",
  children,
  className = "",
}: AppShellProps) {
  const nav = { items, selectedKey, onSelectionChange, "aria-label": navLabel };
  return (
    <div
      data-slot="app-shell"
      className={`bg-surface text-on-surface @container h-full ${className}`}
    >
      <div className="flex h-full flex-col @[600px]:flex-row">
        {/* No `href`: a fragment would be one more entry in the history,
            and under a router one more navigation. The press moves the
            focus, which is the whole of what a skip link does. */}
        <Link
          onPress={() => document.getElementById(MAIN_ID)?.focus()}
          className="bg-inverse-surface text-inverse-on-surface rounded-shape-small sr-only z-10 px-4 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
        >
          {skipLabel}
        </Link>
        {/* Medium and expanded: the rail. */}
        <div className="hidden shrink-0 @[600px]:block @[1200px]:hidden">
          <NavigationRail {...nav} header={railHeader} footer={railFooter} />
        </div>
        {/* Large: the rail, expanded. */}
        <div className="hidden shrink-0 @[1200px]:block">
          <NavigationRail
            {...nav}
            isExpanded
            header={railHeader}
            footer={railFooter}
          />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {topBar}
          <main
            id={MAIN_ID}
            tabIndex={-1}
            className="min-h-0 flex-1 overflow-auto outline-hidden"
          >
            {children}
          </main>
        </div>
        {/* Compact: the navigation bar, under the content. */}
        <div className="shrink-0 @[600px]:hidden">
          <BottomNavigation {...nav} />
        </div>
      </div>
    </div>
  );
}

export default AppShell;
