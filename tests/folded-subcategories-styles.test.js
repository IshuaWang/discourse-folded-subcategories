import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const stylesheetPath = path.resolve(
  process.cwd(),
  "common",
  "common.scss"
);

test("child indent keeps the same margin on hover and focus states", () => {
  const stylesheet = fs.readFileSync(stylesheetPath, "utf8");

  assert.match(stylesheet, /\.sidebar-section-link-wrapper\.folded-subcategories-child:hover/);
  assert.match(
    stylesheet,
    /\.sidebar-section-link-wrapper\.folded-subcategories-child:focus-within/
  );
  assert.match(
    stylesheet,
    /margin-inline-start:\s*var\(--folded-subcategories-indent-size,\s*1ch\)\s*!important;/
  );
});
