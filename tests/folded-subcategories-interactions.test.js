import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeIndentChars,
  resolveParentClickAction,
} from "../javascripts/discourse/lib/folded-subcategories-interactions.js";

test("resolveParentClickAction toggles on parent link click and prevents navigation by default", () => {
  const action = resolveParentClickAction({
    parentId: 10,
    isCurrentCategory: true,
    event: {
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    },
  });

  assert.deepEqual(action, {
    shouldToggle: true,
    shouldPreventNavigation: true,
  });
});

test("resolveParentClickAction always prevents navigation for current category click", () => {
  const action = resolveParentClickAction({
    parentId: 10,
    isCurrentCategory: true,
    event: {
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    },
  });

  assert.deepEqual(action, {
    shouldToggle: true,
    shouldPreventNavigation: true,
  });
});

test("resolveParentClickAction returns no-op for modified click", () => {
  const action = resolveParentClickAction({
    parentId: 10,
    isCurrentCategory: true,
    event: {
      button: 0,
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    },
  });

  assert.deepEqual(action, {
    shouldToggle: false,
    shouldPreventNavigation: false,
  });
});

test("resolveParentClickAction returns no-op when clicked parent is not current category", () => {
  const action = resolveParentClickAction({
    parentId: 10,
    isCurrentCategory: false,
    event: {
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    },
  });

  assert.deepEqual(action, {
    shouldToggle: false,
    shouldPreventNavigation: false,
  });
});

test("normalizeIndentChars keeps valid setting and falls back to default", () => {
  assert.equal(normalizeIndentChars(3), 3);
  assert.equal(normalizeIndentChars("5"), 5);
  assert.equal(normalizeIndentChars(-2), 1);
  assert.equal(normalizeIndentChars("bad"), 1);
});
