import type { Page } from "playwright-core";

export interface FocusStop {
  selector: string;
  html: string;
  tagName: string;
  domIndex: number;
}

/**
 * Tab으로 문서를 순회하며 각 정지점의 선택자·HTML·DOM 순서 인덱스를 기록한다(최대 maxStops,
 * 첫 정지점으로 되돌아오거나 진행이 없으면 종료). 03 §6 b-규칙 인터페이스가 공유하는 헬퍼.
 */
export async function tabTraversal(page: Page, maxStops = 200): Promise<FocusStop[]> {
  await page.evaluate(() => {
    Array.from(document.querySelectorAll("*")).forEach((el, i) => el.setAttribute("data-swwa-order", String(i)));
  });

  const stops: FocusStop[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < maxStops; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active || active === document.body) return null;
      function cssPath(node: Element): string {
        const parts: string[] = [];
        let cur: Element | null = node;
        while (cur) {
          if (cur.id) {
            parts.unshift(`#${cur.id}`);
            break;
          }
          parts.unshift(cur.tagName.toLowerCase());
          cur = cur.parentElement;
        }
        return parts.join(" > ");
      }
      return {
        selector: cssPath(active),
        html: active.outerHTML.slice(0, 300),
        tagName: active.tagName.toLowerCase(),
        domIndex: Number(active.getAttribute("data-swwa-order") ?? "-1"),
      };
    });
    if (!info) break;
    const key = `${info.selector}:${info.domIndex}`;
    if (seen.has(key)) break; // 처음 방문한 정지점으로 돌아왔거나 진행이 없음
    seen.add(key);
    stops.push(info);
  }

  await page.evaluate(() => {
    document.querySelectorAll("[data-swwa-order]").forEach((el) => el.removeAttribute("data-swwa-order"));
  });

  return stops;
}
