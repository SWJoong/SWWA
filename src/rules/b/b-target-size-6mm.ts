import { createFinding } from "../../normalize/finding.js";
import { bTargetSize } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { BrowserContext, BrowserRule } from "../types.js";

const THRESHOLD_PX = 22.7; // 6mm @ 96dpi

export const rule: BrowserRule = {
  id: "b-target-size-6mm",
  kwcag: "6.1.3",
  wcag: ["2.5.8"],
  engine: "b",
  impact: "moderate",
  confidence: "high",
  tier: "B",
  async run(ctx: BrowserContext): Promise<Finding[]> {
    const results = await ctx.page.evaluate((threshold) => {
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
      const candidates = Array.from(
        document.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea, [role="button"]'),
      );
      const out: { selector: string; html: string; diag: number }[] = [];
      for (const el of candidates) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue; // 렌더링되지 않는 요소는 제외
        const diag = Math.sqrt(rect.width ** 2 + rect.height ** 2);
        if (diag >= threshold) continue;
        // 인라인 텍스트 링크 예외: 부모 요소에 이 링크 텍스트 외의 텍스트도 함께 있으면 문장 안의 링크로 본다.
        const isInlineTextLink =
          el.tagName.toLowerCase() === "a" &&
          (el.parentElement?.textContent?.trim().length ?? 0) > (el.textContent?.trim().length ?? 0);
        if (isInlineTextLink) continue;
        out.push({ selector: cssPath(el), html: el.outerHTML.slice(0, 300), diag });
      }
      return out;
    }, THRESHOLD_PX);

    return results.map((r) =>
      createFinding(rule, null, {
        message: bTargetSize.message(Math.round(r.diag)),
        fix: bTargetSize.fix,
        outcome: "fail",
        selectorOverride: r.selector,
        htmlOverride: r.html,
      }),
    );
  },
};
