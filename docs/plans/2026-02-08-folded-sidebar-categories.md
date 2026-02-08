# Folded Sidebar Categories Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Discourse theme component that adds collapsible accordion behavior for parent categories in the sidebar when both parent and child categories are shown.

**Architecture:** Add a sidebar initializer that maps rendered sidebar links to Discourse categories, computes parent-child relationships for visible links, and toggles child visibility by parent state. Keep relationship computation in a pure planner module so behavior can be tested with Node tests before wiring DOM behavior.

**Tech Stack:** Discourse Theme Component (JS initializer + SCSS + settings + locales), Node built-in test runner (`node:test`).

---

### Task 1: Scaffold Theme Component Metadata

**Files:**
- Create: `about.json`
- Create: `settings.yml`
- Create: `locales/en.yml`
- Create: `README.md`

**Step 1: Define component metadata**

Create `about.json` with component name and basic metadata.

**Step 2: Define settings**

Add settings for:
- enable/disable folding behavior
- default parent state (expanded/collapsed)

**Step 3: Add text and docs**

Add locale strings and README usage notes.

**Step 4: Verify metadata files exist**

Run: `find . -maxdepth 2 -type f | sort`
Expected: new metadata/settings/readme files appear.

---

### Task 2: Write Failing Tests for Folding Planner (TDD Red)

**Files:**
- Create: `tests/folded-subcategories-planner.test.js`
- Test target: `javascripts/discourse/lib/folded-subcategories-planner.js`

**Step 1: Write failing tests**

Cover:
- URL/path normalization
- parent-child matching only for visible links
- default collapsed/expanded state from settings
- explicit toggle behavior

**Step 2: Run tests and verify failure**

Run: `node --test --experimental-default-type=module tests/folded-subcategories-planner.test.js`
Expected: FAIL because planner module does not exist yet.

---

### Task 3: Implement Minimal Planner Logic (TDD Green)

**Files:**
- Create: `javascripts/discourse/lib/folded-subcategories-planner.js`

**Step 1: Implement only what tests require**

Add:
- path normalization helper
- category path index lookup
- visible parent-child planner
- collapsed state toggle helper

**Step 2: Re-run planner tests**

Run: `node --test --experimental-default-type=module tests/folded-subcategories-planner.test.js`
Expected: PASS.

---

### Task 4: Wire Planner into Sidebar Initializer

**Files:**
- Create: `javascripts/discourse/initializers/folded-subcategories-sidebar.js`

**Step 1: Build DOM collection layer**

Collect sidebar category links and resolve them to category IDs using site category data.

**Step 2: Apply accordion classes and state**

Use planner output to:
- mark foldable parent links
- hide/show visible child links
- set aria-expanded on parent links

**Step 3: Add click toggle behavior**

On normal left click of foldable parent category:
- prevent navigation
- toggle collapse state
- re-apply classes

**Step 4: Add auto-refresh hooks**

Re-apply folding on:
- page changes
- sidebar DOM mutations

---

### Task 5: Add Styling and Final Verification

**Files:**
- Create: `common/common.scss`

**Step 1: Add foldable affordance styles**

Style parent rows with caret indicator and collapsed/expanded transition.

**Step 2: Add child hidden state style**

Use a class to hide children when collapsed.

**Step 3: End-to-end verification commands**

Run:
- `node --test --experimental-default-type=module tests/folded-subcategories-planner.test.js`
- `git status --short`

Expected:
- tests pass
- component files created and staged changes visible.
