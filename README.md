# Folded Subcategories Sidebar (Discourse Theme Component)

This theme component adds accordion behavior to category links in the sidebar.

## What it does

- Works with user-customized sidebar category lists.
- If a parent category and one or more of its subcategories are all visible in the sidebar, the parent becomes foldable.
- Clicking the foldable parent toggles subcategory visibility.
- Supports default initial state:
  - expanded
  - collapsed

## Settings

- `folded_subcategories_enabled`:
  - Turn fold behavior on/off.
- `folded_subcategories_default_expanded`:
  - `true`: parents start expanded.
  - `false`: parents start collapsed.

## Behavior notes

- Normal left click on a foldable parent category toggles the accordion and does not navigate.
- Modified clicks (Ctrl/Cmd/Shift/Alt or middle-click) keep default browser behavior.
