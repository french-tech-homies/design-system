/* =============================================================================
   The `MD3/Your theme` page: the control, what it says, and a sample

   Kept here, not in the story file: the catalog's stylesheet scans `stories/`
   for utilities, and this page is mostly prose. For the same reason its layout
   is inline style reading the theme's variables; the only classes are the
   kit's components' own and three role utilities the catalog always compiles.
   ========================================================================== */

import {
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { DropZone, FileTrigger } from "react-aria-components";

import { Body, Headline, Label, Title } from "../../primitives/Typography";
import Button from "../../components/Button";
import Card, { CardContent } from "../../components/Card";
import Chip from "../../components/Chip";
import { Switch } from "../../components/Switch";
import { UploadIcon } from "../../icons";
import { HANDED, handedTheme, type Controller } from "./controller";
import { generateFromDesignMd } from "./from-design-md";
import { MAX_FILE_BYTES, readHanded } from "./read-theme";

const column = (gap: number): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap,
});
const row: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 12,
};
const list: CSSProperties = {
  ...column(4),
  margin: 0,
  paddingInlineStart: 20,
  listStyle: "disc",
};
const zone: CSSProperties = {
  ...column(12),
  alignItems: "center",
  padding: 24,
  textAlign: "center",
  border: "2px dashed var(--md-sys-color-outline)",
  borderRadius: "var(--md-sys-shape-corner-medium)",
  background: "var(--md-sys-color-surface-container-low)",
};
const refusalBox: CSSProperties = {
  padding: 16,
  borderRadius: "var(--md-sys-shape-corner-small)",
  background: "var(--md-sys-color-error-container)",
  color: "var(--md-sys-color-on-error-container)",
};
const statusBox: CSSProperties = {
  ...column(8),
  padding: 16,
  borderRadius: "var(--md-sys-shape-corner-small)",
  background: "var(--md-sys-color-surface-container)",
};

/** Words with `code` between backticks. */
function Words({ children }: { children: string }) {
  return (
    <>
      {children
        .split("`")
        .map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}
    </>
  );
}

function Lines({ title, lines }: { title: string; lines: string[] }) {
  if (lines.length === 0) return null;
  return (
    <div style={column(4)}>
      <Label component="span" size="large">
        {title}
      </Label>
      <ul style={list}>
        {lines.map((line, i) => (
          <Item key={i}>
            <Words>{line}</Words>
          </Item>
        ))}
      </ul>
    </div>
  );
}

function Item({ children }: { children: ReactNode }) {
  return (
    <li>
      <Body component="span">{children}</Body>
    </li>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={column(12)}>
      <Title component="h2" size="medium">
        {title}
      </Title>
      {children}
    </section>
  );
}

const tooLarge = (name: string) =>
  `\`${name}\` is larger than ${MAX_FILE_BYTES / 1024} kB, and a generated theme is under 40 kB. Hand \`theme.css\` and \`theme.v4.css\` together, or your \`DESIGN.md\` alone.`;

export function YourThemePanel({
  controller = handedTheme,
}: {
  controller?: Controller;
}) {
  const { theme, drawing, kept } = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
  );
  const [refusal, setRefusal] = useState<string | null>(null);

  const hand = async (files: File[]) => {
    const large = files.find((file) => file.size > MAX_FILE_BYTES);
    if (large) return setRefusal(tooLarge(large.name));
    const result = await readHanded(
      await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          text: await file.text(),
        })),
      ),
      generateFromDesignMd,
    );
    if (!result.ok) return setRefusal(result.message);
    setRefusal(null);
    controller.hand(result.theme);
  };

  const count = (map: Record<string, string>) => Object.keys(map).length;

  return (
    <div
      className="bg-surface text-on-surface"
      style={{ ...column(32), padding: 24, maxWidth: 880 }}
    >
      <header style={column(8)}>
        <Headline component="h1" size="medium">
          Your theme
        </Headline>
        <Body size="large">
          Hand the catalog what your project generated and every story draws
          under it, in light and in dark, until you hand another theme or go
          back to the kit&apos;s default. It is read in this browser and goes
          nowhere else: nothing is uploaded, and no address a file names is
          ever fetched.
        </Body>
      </header>

      <Section title="Hand a theme">
        <Body>
          <Words>
            Either the two generated files together, `theme.css` and
            `theme.v4.css` (from the folder your project generated, `theme/`),
            or your `DESIGN.md` alone: the catalog then runs the kit&apos;s own
            generator here and shows its warnings.
          </Words>
        </Body>
        <DropZone
          aria-label="Drop theme files here"
          style={zone}
          onDrop={async (event) => {
            const dropped = event.items.filter((item) => item.kind === "file");
            if (dropped.length < event.items.length) {
              return setRefusal(
                "A folder or something that is not a file was dropped. Open the folder and hand the files inside it: `theme.css` and `theme.v4.css` together, or your `DESIGN.md` alone.",
              );
            }
            await hand(await Promise.all(dropped.map((item) => item.getFile())));
          }}
        >
          <Body component="span">Drop the files here, or</Body>
          <FileTrigger
            allowsMultiple
            onSelect={(files) => {
              if (files && files.length > 0) void hand(Array.from(files));
            }}
          >
            <Button variant="tonal" icon={UploadIcon}>
              Choose files
            </Button>
          </FileTrigger>
        </DropZone>

        {refusal && (
          <div role="alert" style={refusalBox}>
            <Body component="span">
              <Words>{refusal}</Words>
            </Body>
          </div>
        )}

        <div role="status" style={statusBox}>
          {theme ? (
            <>
              <Body>
                {drawing ? "Drawing " : "Holding "}
                <strong>{theme.name || "a handed theme"}</strong>
                {drawing
                  ? " on every story: the toolbar’s Preset says “Your theme (handed)”."
                  : ". The catalog is drawing the kit’s own identity; choose “Your theme (handed)” under Preset in the toolbar to draw it again."}
              </Body>
              <Body>
                {count(theme.light)} light roles, {count(theme.dark)} dark
                roles, {count(theme.root)} type, corner, elevation, state,
                motion and face values.{" "}
                {kept
                  ? "Kept in this browser, so it is still here after a reload."
                  : "This browser refuses storage here: the theme is kept until this page is reloaded."}
              </Body>
              <Lines title="Left out of what you handed" lines={theme.notes} />
              <Lines title="The generator’s warnings" lines={theme.warnings} />
            </>
          ) : (
            <Body>
              No theme is held: the catalog is drawing the kit&apos;s own.
            </Body>
          )}
        </div>

        {theme && (
          <div style={row}>
            <Button
              variant="outlined"
              onPress={() =>
                controller.choose(drawing ? controller.identity() : HANDED)
              }
            >
              {drawing ? "Show the kit’s default" : "Show your theme"}
            </Button>
            <Button variant="text" onPress={() => controller.forget()}>
              Forget this theme
            </Button>
          </div>
        )}
      </Section>

      <Section title="A sample">
        <div style={row}>
          <Button variant="filled">Filled button</Button>
          <Button variant="outlined">Outlined</Button>
          <Chip>Assist chip</Chip>
          <Switch aria-label="Sample switch" defaultSelected />
        </div>
        <Headline component="div" size="small" data-sample="headline">
          A headline in the brand face
        </Headline>
        <div style={{ ...row, alignItems: "stretch", gap: 24 }}>
          <div style={{ width: 260 }}>
            <Card variant="elevated">
              <CardContent
                headline="Elevated card"
                supportingText="First elevation level, large corner."
              />
            </Card>
          </div>
          <div
            data-sample="elevation-2"
            className="bg-surface-container-low rounded-shape-medium shadow-elevation-2"
            style={{ width: 260, padding: 16 }}
          >
            <Body component="span">Second elevation level, medium corner.</Body>
          </div>
        </div>
        <Body>Open any other story: it draws under the same theme.</Body>
      </Section>

      <Section title="What a handed theme changes">
        <ul style={list}>
          <Item>
            Every colour role, in both schemes. The toolbar&apos;s Theme switch
            chooses light or dark, whether your DESIGN.md switches dark by a
            class or by the system setting.
          </Item>
          <Item>
            The type scale and its two faces, the six corners, the five
            elevation levels, the state layer opacities, the easings and the
            durations.
          </Item>
        </ul>
      </Section>

      <Section title="What it does not change">
        <ul style={list}>
          <Item>
            <Words>
              Fonts are not loaded. The catalog loads Inter and nothing else,
              and never fetches a face by a name read from a file: a family
              your theme names draws only if this machine has it installed,
              otherwise the stack behind it does.
            </Words>
          </Item>
          <Item>
            <Words>
              Hand edits to the Tailwind mappings or the `@utility` blocks of a
              `theme.v4.css` are not read: the catalog compiled its utilities
              when it was built. Only the theme&apos;s own variables move.
            </Words>
          </Item>
          <Item>
            The Foundations pages keep showing the kit&apos;s default values:
            they document the shipped theme, not the one applied.
          </Item>
          <Item>
            The Editorial preset is off while your theme draws: it is another
            identity, with component rules of its own.
          </Item>
          <Item>
            <Words>
              Contrast is yours to read: the generator&apos;s warnings above
              when you hand a `DESIGN.md`, the warnings section of
              `theme/DESIGN.resolved.md` for generated files, and the
              Accessibility panel on each story.
            </Words>
          </Item>
        </ul>
      </Section>
    </div>
  );
}
