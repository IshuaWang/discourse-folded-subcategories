import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const initializerPath = path.resolve(
  process.cwd(),
  "javascripts",
  "discourse",
  "initializers",
  "folded-subcategories-sidebar.js"
);

test("initializer enforces child indent with inline important style", () => {
  const initializer = fs.readFileSync(initializerPath, "utf8");

  assert.match(
    initializer,
    /wrapper\.style\.removeProperty\(\s*"margin-inline-start"\s*\);/
  );
  assert.match(
    initializer,
    /wrapper\.style\.setProperty\(\s*"margin-inline-start",\s*"var\(--folded-subcategories-indent-size,\s*1ch\)",\s*"important"\s*\);/
  );
});
