export function getRenderDecision({ enabled, hasSidebar, categoriesCount, linksCount }) {
  if (!enabled || !hasSidebar) {
    return "clear";
  }

  if (!categoriesCount || !linksCount) {
    return "skip";
  }

  return "decorate";
}
