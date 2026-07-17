import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const css = readFileSync(
  path.join(process.cwd(), "src", "app", "globals.css"),
  "utf8",
);

const printBlock = css.slice(css.indexOf("@media print"));

const appShell = readFileSync(
  path.join(process.cwd(), "src", "components", "layout", "app-shell.tsx"),
  "utf8",
);

describe("print CSS regression (PDF output)", () => {
  it("has a @media print block", () => {
    assert.ok(css.includes("@media print"));
  });

  it("hides the sidebar and no-print elements when printing", () => {
    assert.match(printBlock, /aside[\s\S]*?display:\s*none\s*!important/);
    assert.match(printBlock, /\.no-print[\s\S]*?display:\s*none\s*!important/);
  });

  it("hides the document editor panel when printing", () => {
    assert.ok(printBlock.includes(".document-editor-panel"));
  });

  it("flattens the flex layout so content is not clipped", () => {
    assert.match(
      printBlock,
      /\.print-layout[\s\S]*?display:\s*block\s*!important/,
    );
    assert.match(printBlock, /overflow:\s*visible\s*!important/);
  });

  it("keeps A4 page dimensions for documents", () => {
    assert.match(printBlock, /\.document-a4[\s\S]*?width:\s*210mm\s*!important/);
    assert.match(printBlock, /@page[\s\S]*?size:\s*A4/);
  });

  it("removes the preview scale transform when printing", () => {
    assert.match(printBlock, /\.document-a4[\s\S]*?transform:\s*none\s*!important/);
  });
});

describe("app shell print classes", () => {
  it("marks the layout root with print-layout", () => {
    assert.ok(appShell.includes("print-layout"));
  });

  it("hides the mobile header block when printing", () => {
    // The mobile-only header (md:hidden) must carry no-print so it never
    // appears in the printed PDF; the desktop sidebar is an <aside>, which
    // the print CSS hides globally.
    assert.match(
      appShell,
      /no-print[^"]*(?:md|lg):hidden|(?:md|lg):hidden[^"]*no-print/,
    );
  });
});
