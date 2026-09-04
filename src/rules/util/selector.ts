/**
 * 요소를 가리키는 CSS 선택자를 만든다. id가 있으면 그 즉시 `#id`로 끝내고, 없으면 조상으로
 * 올라가며 태그명을 이어 붙인다(예: `html > head > title`). 픽스처가 대부분 id를 갖도록 작성돼
 * 있어 규칙 결과가 안정적으로 스냅샷된다(04-qa-plan §1).
 */
export function cssPath(el: Element): string {
  const parts: string[] = [];
  let node: Element | null = el;
  while (node) {
    if (node.id) {
      parts.unshift(`#${node.id}`);
      break;
    }
    parts.unshift(node.tagName.toLowerCase());
    node = node.parentElement;
  }
  return parts.join(" > ");
}
