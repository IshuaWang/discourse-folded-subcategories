# Folded Subcategories Sidebar (Discourse Theme Component)

This theme component adds accordion behavior to category links in the sidebar.

## What it does

- Works with user-customized sidebar category lists.
- If a parent category and one or more of its subcategories are all visible in the sidebar, the parent becomes foldable.
- Clicking the foldable parent caret toggles subcategory visibility (or parent text too when configured).
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
- `folded_subcategories_toggle_on_parent_link_click`:
  - `false` (default): clicking parent text only navigates; caret toggles.
  - `true`: clicking parent text both toggles and navigates.

## Behavior notes

- Clicking parent category text uses normal Discourse navigation.
- Clicking the small caret after a foldable parent label toggles accordion state.
- Modified clicks (Ctrl/Cmd/Shift/Alt or middle-click) keep default browser behavior.
