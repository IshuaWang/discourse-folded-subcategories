export const LINK_WRAPPER_SELECTOR = ".sidebar-section-link-wrapper";
export const LINK_SELECTOR = `${LINK_WRAPPER_SELECTOR} a[href]`;

function isElementNode(node) {
  return node?.nodeType === 1;
}

function matchesOrContainsSidebarLink(node) {
  if (!isElementNode(node)) {
    return false;
  }

  if (typeof node.matches === "function") {
    if (node.matches(LINK_WRAPPER_SELECTOR) || node.matches(LINK_SELECTOR)) {
      return true;
    }
  }

  if (typeof node.querySelector !== "function") {
    return false;
  }

  return Boolean(
    node.querySelector(LINK_WRAPPER_SELECTOR) || node.querySelector(LINK_SELECTOR)
  );
}

export function isSidebarMutation(mutation) {
  if (!mutation || mutation.type !== "childList") {
    return false;
  }

  for (const node of mutation.addedNodes || []) {
    if (matchesOrContainsSidebarLink(node)) {
      return true;
    }
  }

  for (const node of mutation.removedNodes || []) {
    if (matchesOrContainsSidebarLink(node)) {
      return true;
    }
  }

  return false;
}
