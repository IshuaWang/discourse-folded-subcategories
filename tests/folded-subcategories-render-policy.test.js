import test from "node:test";
import assert from "node:assert/strict";

import { getRenderDecision } from "../javascripts/discourse/lib/folded-subcategories-render-policy.js";

test("getRenderDecision clears classes when feature disabled", () => {
  const decision = getRenderDecision({
    enabled: false,
    hasSidebar: true,
    categoriesCount: 10,
    linksCount: 10,
  });

  assert.equal(decision, "clear");
});

test("getRenderDecision skips class reset when sidebar links are temporarily empty", () => {
  const decision = getRenderDecision({
    enabled: true,
    hasSidebar: true,
    categoriesCount: 10,
    linksCount: 0,
  });

  assert.equal(decision, "skip");
});

test("getRenderDecision decorates when data is complete", () => {
  const decision = getRenderDecision({
    enabled: true,
    hasSidebar: true,
    categoriesCount: 10,
    linksCount: 8,
  });

  assert.equal(decision, "decorate");
});
