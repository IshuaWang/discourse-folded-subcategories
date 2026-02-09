import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  findSidebarObserverTarget,
  isSidebarMutation,
} from "../javascripts/discourse/lib/folded-subcategories-observer.js";

const initializerPath = path.resolve(
  process.cwd(),
  "javascripts",
  "discourse",
  "initializers",
  "folded-subcategories-sidebar.js"
);

function elementStub({
  matchSelectors = new Set(),
  querySelectors = new Set(),
  closestResult = null,
  parentElement = null,
} = {}) {
  return {
    nodeType: 1,
    matches(selector) {
      return matchSelectors.has(selector);
    },
    querySelector(selector) {
      return querySelectors.has(selector) ? { nodeType: 1 } : null;
    },
    closest() {
      return closestResult;
    },
    parentElement,
  };
}

test("isSidebarMutation returns true when added nodes include sidebar links", () => {
  const mutation = {
    type: "childList",
    addedNodes: [
      elementStub({
        matchSelectors: new Set([".sidebar-section-link-wrapper"]),
      }),
    ],
    removedNodes: [],
  };

  assert.equal(isSidebarMutation(mutation), true);
});

test("isSidebarMutation returns true when removed nodes contain sidebar links", () => {
  const mutation = {
    type: "childList",
    addedNodes: [],
    removedNodes: [
      elementStub({
        querySelectors: new Set([".sidebar-section-link-wrapper a[href]"]),
      }),
    ],
  };

  assert.equal(isSidebarMutation(mutation), true);
});

test("isSidebarMutation ignores unrelated DOM mutations", () => {
  const mutation = {
    type: "childList",
    addedNodes: [{ nodeType: 3 }],
    removedNodes: [elementStub()],
  };

  assert.equal(isSidebarMutation(mutation), false);
});

test("findSidebarObserverTarget prefers sidebar section container", () => {
  const container = {};
  const wrapper = elementStub({ closestResult: container });
  const doc = {
    body: { body: true },
    querySelector() {
      return wrapper;
    },
  };

  assert.equal(findSidebarObserverTarget(doc), container);
});

test("findSidebarObserverTarget falls back to body when sidebar is missing", () => {
  const body = { body: true };
  const doc = {
    body,
    querySelector() {
      return null;
    },
  };

  assert.equal(findSidebarObserverTarget(doc), body);
});

test("initializer uses observer mutation filter and dynamic target selection", () => {
  const initializer = fs.readFileSync(initializerPath, "utf8");

  assert.match(initializer, /mutations\.some\(isSidebarMutation\)/);
  assert.match(initializer, /findSidebarObserverTarget\(document\)/);
});
