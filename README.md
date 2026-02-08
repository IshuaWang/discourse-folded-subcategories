# Folded Subcategories Sidebar (Discourse Theme Component)

This theme component adds accordion behavior to category links in the sidebar.

## What it does

- Works with user-customized sidebar category lists.
- If a parent category and one or more of its subcategories are all visible in the sidebar, the parent becomes foldable.
- Clicking the foldable parent text toggles subcategory visibility.
- Supports default initial state:
  - expanded
  - collapsed

## Settings

- `folded_subcategories_enabled`:
  - Turn fold behavior on/off.
- `folded_subcategories_default_expanded`:
  - `true`: parents start expanded.
  - `false`: parents start collapsed.
- `folded_subcategories_indent_chars`:
  - Controls child category indent in character units.
  - Default is `1` (equal to `1ch`).

## Behavior notes

- Clicking a parent category from another category only navigates, it does not toggle.
- Clicking the currently active parent category toggles accordion and stays on the same route.
- The arrow at the right side is visual-only.
- Modified clicks (Ctrl/Cmd/Shift/Alt or middle-click) keep default browser behavior.
