"use client";

/**
 * SiteHeader: the header of a public page.
 *
 * A block of the MD3 kit: it is copied into your project to be edited. It is
 * yours from then on: an update of the kit does not touch it. It is built
 * from the kit's `Link`, `Button`, `IconButton`, `Menu` and type primitives.
 *
 *   <SiteHeader
 *     brand={<Link href="/" color="inherit" underline="hover">Tally</Link>}
 *     links={[
 *       { id: "features", label: "Features", href: "/#features" },
 *       { id: "pricing", label: "Pricing", href: "/pricing" },
 *     ]}
 *     actions={<Button href="/signup">Start free trial</Button>}
 *   />
 *
 * The kit's `TopAppBar` is Material's: an app's bar, with a title that is a
 * heading and at most three actions. A public page's header is a row of
 * links to its sections and pages. Where the header is at least 48rem wide
 * the links are drawn in a row; narrower, they fold into a menu behind one
 * icon button, and `actions` stays in view at every width. It folds by its
 * own width (a container query), not the window's, so it is right inside a
 * narrow column too.
 *
 * Neither Material 3 nor React Aria describes it. It borrows the small app
 * bar's 64dp height and `surface` ground
 * (https://m3.material.io/components/app-bars/specs), the kit's `Link` for
 * its links and Material's menu for the folded ones.
 */
import { IconButton, Link, Menu, Title } from "@/registry/ds/ui/ds";
import type { ReactNode } from "react";

export type SiteLink = { id: string; label: string; href: string };

export type SiteHeaderProps = {
  /** The product's name or mark, as a link to the home page. */
  brand: ReactNode;
  links: SiteLink[];
  /** What stays in view at every width: a call to action, a sign-in link. */
  actions?: ReactNode;
  /** The name of the links' landmark. */
  navLabel?: string;
  /** The name of the button the links fold behind. */
  menuLabel?: string;
  className?: string;
};

function MenuIcon({ size = 24 }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function SiteHeader({
  brand,
  links,
  actions,
  navLabel = "Site",
  menuLabel = "Menu",
  className = "",
}: SiteHeaderProps) {
  return (
    <header
      className={`bg-surface text-on-surface border-outline-variant @container flex min-h-16 items-center gap-4 border-b px-4 ${className}`}
    >
      <Title size="large" component="div" className="shrink-0">
        {brand}
      </Title>
      <nav aria-label={navLabel} className="hidden min-w-0 flex-1 @3xl:block">
        <ul className="text-on-surface-variant text-label-large font-label-large flex items-center gap-6">
          {links.map((link) => (
            <li key={link.id}>
              <Link
                href={link.href}
                color="inherit"
                underline="hover"
                className="inline-flex min-h-12 items-center"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="ms-auto flex items-center gap-2">
        {actions}
        <div className="@3xl:hidden">
          <Menu
            placement="bottom end"
            items={links.map((link) => ({
              id: link.id,
              label: link.label,
              href: link.href,
            }))}
            triggerButton={
              <IconButton
                variant="standard"
                icon={MenuIcon}
                aria-label={menuLabel}
              />
            }
          />
        </div>
      </div>
    </header>
  );
}
