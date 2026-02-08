function isPrimaryUnmodifiedClick(event) {
  return (
    event?.button === 0 &&
    !event?.metaKey &&
    !event?.ctrlKey &&
    !event?.shiftKey &&
    !event?.altKey
  );
}

function noOpClickAction() {
  return {
    shouldToggle: false,
    shouldPreventNavigation: false,
  };
}

export function resolveParentClickAction({
  event,
  parentId,
  isCurrentCategory,
}) {
  if (!parentId || !isPrimaryUnmodifiedClick(event) || !isCurrentCategory) {
    return noOpClickAction();
  }

  return {
    shouldToggle: true,
    shouldPreventNavigation: true,
  };
}

export function normalizeIndentChars(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}
