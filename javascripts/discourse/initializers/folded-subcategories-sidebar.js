import { apiInitializer } from "discourse/lib/api";
import {
  buildSidebarPlan,
  normalizePathname,
  toggleCollapsedState,
} from "../lib/folded-subcategories-planner";

const LINK_WRAPPER_SELECTOR = ".sidebar-section-link-wrapper";
const LINK_SELECTOR = `${LINK_WRAPPER_SELECTOR} a[href]`;
const PARENT_CLASS = "folded-subcategories-parent";
const CHILD_CLASS = "folded-subcategories-child";
const COLLAPSED_CLASS = "folded-subcategories-collapsed";
const EXPANDED_CLASS = "folded-subcategories-expanded";
const HIDDEN_CLASS = "folded-subcategories-hidden";
const CARET_CLASS = "folded-subcategories-caret";
const DATA_LINK_ID = "foldedSubcategoriesLinkId";
const DATA_PARENT_ID = "foldedSubcategoriesParentId";
const DATA_CHILD_OF = "foldedSubcategoriesChildOf";

let nextLinkId = 0;

function parseCategoryId(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).replace(/^category-/, "");
  const parsed = Number.parseInt(normalized, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function isPrimaryUnmodifiedClick(event) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function getSiteCategories(api) {
  const site = api.container.lookup("site:main");
  return site?.categories || [];
}

function getCategoryIdHint(anchor, wrapper) {
  return (
    parseCategoryId(anchor?.dataset?.categoryId) ||
    parseCategoryId(wrapper?.dataset?.categoryId) ||
    parseCategoryId(wrapper?.dataset?.listItemName) ||
    null
  );
}

function ensureLinkId(wrapper) {
  if (!wrapper.dataset[DATA_LINK_ID]) {
    nextLinkId += 1;
    wrapper.dataset[DATA_LINK_ID] = `folded-subcategories-${nextLinkId}`;
  }

  return wrapper.dataset[DATA_LINK_ID];
}

function ensureCaret(anchor) {
  if (!anchor || anchor.querySelector(`.${CARET_CLASS}`)) {
    return;
  }

  const caret = document.createElement("span");
  caret.className = CARET_CLASS;
  caret.setAttribute("aria-hidden", "true");
  anchor.prepend(caret);
}

function resetSidebarClasses() {
  document.querySelectorAll(LINK_WRAPPER_SELECTOR).forEach((wrapper) => {
    wrapper.classList.remove(
      PARENT_CLASS,
      CHILD_CLASS,
      COLLAPSED_CLASS,
      EXPANDED_CLASS,
      HIDDEN_CLASS
    );

    delete wrapper.dataset[DATA_PARENT_ID];
    delete wrapper.dataset[DATA_CHILD_OF];

    const anchor = wrapper.querySelector("a[href]");
    anchor?.removeAttribute("aria-expanded");

    const caret = anchor?.querySelector(`.${CARET_CLASS}`);
    caret?.remove();
  });
}

function collectSidebarLinks() {
  const links = [];

  document.querySelectorAll(LINK_SELECTOR).forEach((anchor) => {
    const wrapper = anchor.closest(LINK_WRAPPER_SELECTOR);
    if (!wrapper) {
      return;
    }

    links.push({
      anchor,
      wrapper,
      linkId: ensureLinkId(wrapper),
      pathname: normalizePathname(anchor.getAttribute("href")),
      categoryId: getCategoryIdHint(anchor, wrapper),
    });
  });

  return links;
}

function hasSidebarInDOM() {
  return Boolean(document.querySelector(LINK_WRAPPER_SELECTOR));
}

export default apiInitializer("1.18.0", (api) => {
  let collapsedByParentId = {};
  let refreshQueued = false;
  let observerStarted = false;

  function decorateSidebar() {
    resetSidebarClasses();

    if (!settings.folded_subcategories_enabled || !hasSidebarInDOM()) {
      return;
    }

    const categories = getSiteCategories(api);
    const sidebarLinks = collectSidebarLinks();

    if (!categories.length || !sidebarLinks.length) {
      return;
    }

    const plan = buildSidebarPlan({
      links: sidebarLinks,
      categories,
      collapsedByParentId,
      defaultExpanded: settings.folded_subcategories_default_expanded,
    });

    collapsedByParentId = plan.collapsedByParentId;

    const parentLinkIds = new Set(plan.parentLinkIds);
    const hiddenLinkIds = new Set(plan.hiddenLinkIds);

    sidebarLinks.forEach((link) => {
      const { linkId, wrapper, anchor } = link;

      if (parentLinkIds.has(linkId)) {
        const parentId = plan.parentLinkIdToParentId[linkId];
        const isCollapsed = Boolean(collapsedByParentId[parentId]);

        wrapper.classList.add(PARENT_CLASS);
        wrapper.classList.add(isCollapsed ? COLLAPSED_CLASS : EXPANDED_CLASS);
        wrapper.dataset[DATA_PARENT_ID] = String(parentId);

        anchor?.setAttribute("aria-expanded", String(!isCollapsed));
        ensureCaret(anchor);
      }

      if (plan.linkToParentId[linkId]) {
        wrapper.classList.add(CHILD_CLASS);
        wrapper.dataset[DATA_CHILD_OF] = String(plan.linkToParentId[linkId]);
      }

      if (hiddenLinkIds.has(linkId)) {
        wrapper.classList.add(HIDDEN_CLASS);
      }
    });
  }

  function scheduleDecorateSidebar() {
    if (refreshQueued) {
      return;
    }

    refreshQueued = true;
    requestAnimationFrame(() => {
      refreshQueued = false;
      decorateSidebar();
    });
  }

  function startSidebarObserver() {
    if (observerStarted) {
      return;
    }

    observerStarted = true;

    const observer = new MutationObserver(() => {
      scheduleDecorateSidebar();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  document.addEventListener(
    "click",
    (event) => {
      if (!settings.folded_subcategories_enabled || !isPrimaryUnmodifiedClick(event)) {
        return;
      }

      const anchor = event.target.closest(
        `${LINK_WRAPPER_SELECTOR}.${PARENT_CLASS} > a[href]`
      );

      if (!anchor) {
        return;
      }

      const wrapper = anchor.closest(LINK_WRAPPER_SELECTOR);
      const parentId = parseCategoryId(wrapper?.dataset?.[DATA_PARENT_ID]);

      if (!parentId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      collapsedByParentId = toggleCollapsedState(collapsedByParentId, parentId);
      scheduleDecorateSidebar();
    },
    true
  );

  startSidebarObserver();
  api.onPageChange(() => scheduleDecorateSidebar());
  scheduleDecorateSidebar();
});
