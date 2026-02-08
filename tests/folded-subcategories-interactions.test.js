import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeIndentChars,
  resolveParentClickAction,
} from "../javascripts/discourse/lib/folded-subcategories-interactions.js";

test("resolveParentClickAction toggles on caret click and prevents navigation", () => {
  const action = resolveParentClickAction({
    parentId: 10,
    clickedCaret: true,
    toggleOnParentLinkClick: false,
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

test("resolveParentClickAction keeps link click navigation by default", () => {
  const action = resolveParentClickAction({
    parentId: 10,
    clickedCaret: false,
    toggleOnParentLinkClick: false,
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

test("resolveParentClickAction toggles on parent link click when mode is enabled", () => {
  const action = resolveParentClickAction({
    parentId: 10,
    clickedCaret: false,
    toggleOnParentLinkClick: true,
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
    shouldPreventNavigation: false,
  });
});

test("resolveParentClickAction returns no-op for modified click", () => {
  const action = resolveParentClickAction({
    parentId: 10,
    clickedCaret: true,
    toggleOnParentLinkClick: true,
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

test("normalizeIndentChars keeps valid setting and falls back to default", () => {
  assert.equal(normalizeIndentChars(3), 3);
  assert.equal(normalizeIndentChars("5"), 5);
  assert.equal(normalizeIndentChars(-2), 1);
  assert.equal(normalizeIndentChars("bad"), 1);
});
