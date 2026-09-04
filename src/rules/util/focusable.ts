const NATIVELY_FOCUSABLE_TAGS = new Set(["a", "button", "select", "textarea", "audio", "video"]);

/** 문서 순서 스캔 등에 쓰는 "초점 가능 요소" 근사 판별(정적 마크업 기준, 실제 렌더링 상태는 모른다). */
export function isFocusable(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  const tabindex = el.getAttribute("tabindex");
  if (tabindex !== null && Number(tabindex) < 0) return false;
  if (tabindex !== null && !Number.isNaN(Number(tabindex))) return true;
  if (tag === "a" || tag === "area") return el.hasAttribute("href");
  if (tag === "input") return el.getAttribute("type") !== "hidden" && !el.hasAttribute("disabled");
  if (NATIVELY_FOCUSABLE_TAGS.has(tag)) return !el.hasAttribute("disabled");
  return false;
}

/** 문서 순서상 첫 초점 가능 요소를 찾는다(k-skip-link-first). */
export function firstFocusable(document: Document): Element | null {
  const walker = document.createTreeWalker(document.body ?? document, 1 /* NodeFilter.SHOW_ELEMENT */);
  let node = walker.nextNode() as Element | null;
  while (node) {
    if (isFocusable(node)) return node;
    node = walker.nextNode() as Element | null;
  }
  return null;
}
