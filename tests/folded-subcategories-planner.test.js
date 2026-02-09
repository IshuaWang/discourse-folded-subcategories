import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSidebarPlan,
  normalizePathname,
  toggleCollapsedState,
} from "../javascripts/discourse/lib/folded-subcategories-planner.js";

function sidebarLink(linkId, pathname) {
  return { linkId, pathname };
}

const categories = [
  { id: 10, parent_category_id: null, url: "/c/parent/10" },
  { id: 11, parent_category_id: 10, url: "/c/parent/child/11" },
  { id: 12, parent_category_id: 10, url: "/c/parent/child-two/12" },
  { id: 20, parent_category_id: null, url: "/c/other/20" },
];

test("normalizePathname trims host, query, hash and trailing slash", () => {
  assert.equal(
    normalizePathname("https://community.example.com/c/parent/10/?foo=bar#latest"),
    "/c/parent/10"
  );
  assert.equal(normalizePathname("/c/parent/10/"), "/c/parent/10");
});

test("buildSidebarPlan marks parent and child links and defaults collapsed when configured", () => {
  const result = buildSidebarPlan({
    links: [sidebarLink("p", "/c/parent/10"), sidebarLink("c", "/c/parent/child/11")],
    categories,
    collapsedByParentId: {},
    defaultExpanded: false,
  });

  assert.deepEqual(result.parentLinkIds, ["p"]);
  assert.deepEqual(result.hiddenLinkIds, ["c"]);
  assert.equal(result.linkToParentId.c, 10);
  assert.equal(result.collapsedByParentId[10], true);
});

test("buildSidebarPlan resolves category links that include Discourse list filters", () => {
  const result = buildSidebarPlan({
    links: [
      sidebarLink("p", "/c/parent/10/l/latest"),
      sidebarLink("c", "/c/parent/child/11/l/latest"),
    ],
    categories,
    collapsedByParentId: {},
    defaultExpanded: false,
  });

  assert.deepEqual(result.parentLinkIds, ["p"]);
  assert.deepEqual(result.hiddenLinkIds, ["c"]);
});

test("buildSidebarPlan defaults expanded when configured", () => {
  const result = buildSidebarPlan({
    links: [sidebarLink("p", "/c/parent/10"), sidebarLink("c", "/c/parent/child/11")],
    categories,
    collapsedByParentId: {},
    defaultExpanded: true,
  });

  assert.deepEqual(result.parentLinkIds, ["p"]);
  assert.deepEqual(result.hiddenLinkIds, []);
  assert.equal(result.collapsedByParentId[10], false);
});

test("buildSidebarPlan keeps stored parent state", () => {
  const result = buildSidebarPlan({
    links: [sidebarLink("p", "/c/parent/10"), sidebarLink("c", "/c/parent/child/11")],
    categories,
    collapsedByParentId: { 10: false },
    defaultExpanded: false,
  });

  assert.deepEqual(result.hiddenLinkIds, []);
  assert.equal(result.collapsedByParentId[10], false);
});

test("buildSidebarPlan does not mark parent if child is not visible in sidebar", () => {
  const result = buildSidebarPlan({
    links: [sidebarLink("p", "/c/parent/10")],
    categories,
    collapsedByParentId: {},
    defaultExpanded: false,
  });

  assert.deepEqual(result.parentLinkIds, []);
  assert.deepEqual(result.hiddenLinkIds, []);
});

test("buildSidebarPlan adapts when a child category is created then removed", () => {
  const initial = buildSidebarPlan({
    links: [sidebarLink("p", "/c/parent/10")],
    categories,
    collapsedByParentId: {},
    defaultExpanded: false,
  });

  assert.deepEqual(initial.parentLinkIds, []);
  assert.deepEqual(initial.hiddenLinkIds, []);

  const afterCreate = buildSidebarPlan({
    links: [sidebarLink("p", "/c/parent/10"), sidebarLink("c", "/c/parent/child/11")],
    categories,
    collapsedByParentId: initial.collapsedByParentId,
    defaultExpanded: false,
  });

  assert.deepEqual(afterCreate.parentLinkIds, ["p"]);
  assert.deepEqual(afterCreate.hiddenLinkIds, ["c"]);

  const afterDelete = buildSidebarPlan({
    links: [sidebarLink("p", "/c/parent/10")],
    categories,
    collapsedByParentId: afterCreate.collapsedByParentId,
    defaultExpanded: false,
  });

  assert.deepEqual(afterDelete.parentLinkIds, []);
  assert.deepEqual(afterDelete.hiddenLinkIds, []);
});

test("buildSidebarPlan ignores orphan sidebar links from deleted categories", () => {
  const result = buildSidebarPlan({
    links: [
      sidebarLink("p", "/c/parent/10"),
      sidebarLink("deleted", "/c/deleted/999"),
      sidebarLink("c", "/c/parent/child/11"),
    ],
    categories,
    collapsedByParentId: {},
    defaultExpanded: false,
  });

  assert.deepEqual(result.parentLinkIds, ["p"]);
  assert.deepEqual(result.hiddenLinkIds, ["c"]);
  assert.equal(result.linkToParentId.deleted, undefined);
});

test("toggleCollapsedState flips parent value", () => {
  assert.deepEqual(toggleCollapsedState({}, 10), { 10: true });
  assert.deepEqual(toggleCollapsedState({ 10: true }, 10), { 10: false });
});
