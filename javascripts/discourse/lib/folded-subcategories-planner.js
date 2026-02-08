function toInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function stripTrailingSlash(pathname) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function normalizePathname(rawPath) {
  if (!rawPath) {
    return "/";
  }

  try {
    const url = new URL(rawPath, "https://example.invalid");
    return stripTrailingSlash(url.pathname || "/");
  } catch {
    return stripTrailingSlash(rawPath);
  }
}

function extractCategoryIdFromPath(pathname) {
  const normalizedPath = normalizePathname(pathname);
  const match = normalizedPath.match(/\/c\/[^/]+(?:\/[^/]+)*\/(\d+)(?:\/|$)/);
  return match ? toInteger(match[1]) : null;
}

function categoryPathCandidates(category) {
  const candidates = new Set();

  if (category?.url) {
    candidates.add(normalizePathname(category.url));
  }

  if (category?.slug && category?.id) {
    candidates.add(normalizePathname(`/c/${category.slug}/${category.id}`));
  }

  if (category?.slug_path && category?.id) {
    candidates.add(normalizePathname(`/c/${category.slug_path}/${category.id}`));
  }

  return [...candidates];
}

function buildCategoryIndexes(categories) {
  const categoryById = new Map();
  const categoryByPath = new Map();

  for (const category of categories || []) {
    const id = toInteger(category?.id);

    if (!id) {
      continue;
    }

    categoryById.set(id, category);

    for (const path of categoryPathCandidates(category)) {
      categoryByPath.set(path, category);
    }
  }

  return { categoryById, categoryByPath };
}

export function buildSidebarPlan({
  links,
  categories,
  collapsedByParentId = {},
  defaultExpanded = true,
}) {
  const { categoryById, categoryByPath } = buildCategoryIndexes(categories);

  const resolvedLinks = [];
  for (const link of links || []) {
    const categoryId = toInteger(link?.categoryId);
    const normalizedPath = normalizePathname(link?.pathname);
    const categoryIdFromPath = extractCategoryIdFromPath(normalizedPath);
    const category =
      (categoryId && categoryById.get(categoryId)) ||
      (categoryIdFromPath && categoryById.get(categoryIdFromPath)) ||
      categoryByPath.get(normalizedPath);

    if (!category) {
      continue;
    }

    resolvedLinks.push({
      linkId: link.linkId,
      category,
    });
  }

  const visibleCategoryIds = new Set(
    resolvedLinks.map(({ category }) => toInteger(category.id)).filter(Boolean)
  );

  const linkIdByCategoryId = new Map();
  for (const resolvedLink of resolvedLinks) {
    const categoryId = toInteger(resolvedLink.category.id);
    if (!linkIdByCategoryId.has(categoryId)) {
      linkIdByCategoryId.set(categoryId, resolvedLink.linkId);
    }
  }

  const childLinkIdsByParentId = new Map();
  const linkToParentId = {};

  for (const resolvedLink of resolvedLinks) {
    const categoryId = toInteger(resolvedLink.category.id);
    const parentId = toInteger(resolvedLink.category.parent_category_id);

    if (!categoryId || !parentId) {
      continue;
    }

    if (!visibleCategoryIds.has(parentId) || !linkIdByCategoryId.has(parentId)) {
      continue;
    }

    if (!childLinkIdsByParentId.has(parentId)) {
      childLinkIdsByParentId.set(parentId, []);
    }

    childLinkIdsByParentId.get(parentId).push(resolvedLink.linkId);
    linkToParentId[resolvedLink.linkId] = parentId;
  }

  const nextCollapsedByParentId = { ...collapsedByParentId };
  const parentLinkIds = [];
  const hiddenLinkIds = [];
  const parentLinkIdToParentId = {};

  for (const [parentId, childLinkIds] of childLinkIdsByParentId.entries()) {
    const parentLinkId = linkIdByCategoryId.get(parentId);

    if (!parentLinkId) {
      continue;
    }

    parentLinkIds.push(parentLinkId);
    parentLinkIdToParentId[parentLinkId] = parentId;

    if (nextCollapsedByParentId[parentId] === undefined) {
      nextCollapsedByParentId[parentId] = !defaultExpanded;
    }

    if (nextCollapsedByParentId[parentId]) {
      hiddenLinkIds.push(...childLinkIds);
    }
  }

  return {
    collapsedByParentId: nextCollapsedByParentId,
    hiddenLinkIds,
    linkToParentId,
    parentLinkIds,
    parentLinkIdToParentId,
  };
}

export function toggleCollapsedState(collapsedByParentId, parentId) {
  const parentIdKey = toInteger(parentId);

  if (!parentIdKey) {
    return { ...collapsedByParentId };
  }

  return {
    ...collapsedByParentId,
    [parentIdKey]: !collapsedByParentId[parentIdKey],
  };
}
