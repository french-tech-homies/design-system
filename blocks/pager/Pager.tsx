"use client";

/**
 * Pager: the pages of a list or a table.
 *
 * A block of the MD3 kit: it is copied into your project to be edited. It is
 * yours from then on: an update of the kit does not touch it. It is built
 * from the kit's components (`IconButton`, `Button`, `Menu`, the type
 * primitives), on the kit's role utilities.
 *
 *   <Pager page={page} pageSize={25} total={312} onPageChange={setPage} />
 *   <Pager page={page} pageSize={size} total={total} onPageChange={setPage}
 *     pageSizes={[10, 25, 50]} onPageSizeChange={setSize} />
 *
 * Neither Material 3 nor React Aria describes a pager. It borrows Material's
 * icon buttons (https://m3.material.io/components/icon-buttons/specs) for
 * its steps, its menu (https://m3.material.io/components/menus/specs) for
 * the page size, and body-medium on `on-surface-variant` for what it says.
 */
import {
  Body,
  Button,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  IconButton,
  Menu,
} from "@/registry/ds/ui/ds";

export type PagerProps = {
  /** The page shown, from 1. */
  page: number;
  /** Rows a page. */
  pageSize: number;
  /** Rows in all. */
  total: number;
  onPageChange: (page: number) => void;
  /** The sizes offered. Left out, the pager offers none. */
  pageSizes?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  /** The landmark's name: which list these are the pages of. */
  "aria-label"?: string;
  className?: string;
};

export function Pager({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizes,
  onPageSizeChange,
  "aria-label": label = "Pages",
  className = "",
}: PagerProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const at = Math.min(Math.max(1, page), pages);
  const first = total === 0 ? 0 : (at - 1) * pageSize + 1;
  const last = Math.min(at * pageSize, total);

  return (
    <nav
      aria-label={label}
      className={`text-on-surface-variant flex flex-wrap items-center justify-end gap-x-4 gap-y-2 ${className}`}
    >
      {pageSizes && onPageSizeChange && (
        <Menu
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[String(pageSize)]}
          onSelectionChange={(keys) => {
            if (keys !== "all" && keys.size > 0) {
              onPageSizeChange(Number([...keys][0]));
            }
          }}
          items={pageSizes.map((size) => ({
            id: String(size),
            label: `${size} per page`,
          }))}
          triggerButton={
            <Button variant="text">
              <span className="inline-flex items-center gap-1">
                {pageSize} per page
                <ChevronDownIcon size={18} />
              </span>
            </Button>
          }
        />
      )}
      {/* Said to a screen reader when the page changes. */}
      <Body component="span" aria-live="polite">
        {first}–{last} of {total}
      </Body>
      <div className="flex items-center">
        <IconButton
          variant="standard"
          icon={ChevronLeftIcon}
          aria-label="Previous page"
          isDisabled={at <= 1}
          onPress={() => onPageChange(at - 1)}
          className="rtl:-scale-x-100"
        />
        <IconButton
          variant="standard"
          icon={ChevronRightIcon}
          aria-label="Next page"
          isDisabled={at >= pages}
          onPress={() => onPageChange(at + 1)}
          className="rtl:-scale-x-100"
        />
      </div>
    </nav>
  );
}
