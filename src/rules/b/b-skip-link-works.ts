import { createFinding } from "../../normalize/finding.js";
import { bSkipLinkWorks } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { BrowserContext, BrowserRule } from "../types.js";

export const rule: BrowserRule = {
  id: "b-skip-link-works",
  kwcag: "6.4.1",
  wcag: ["2.4.1"],
  engine: "b",
  impact: "serious",
  confidence: "high",
  tier: "B",
  async run(ctx: BrowserContext): Promise<Finding[]> {
    const { page } = ctx;
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active || active.tagName.toLowerCase() !== "a") return null;
      const href = active.getAttribute("href") ?? "";
      if (!href.startsWith("#") || href.length <= 1) return null;
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
      return { selector: cssPath(active), html: active.outerHTML.slice(0, 300), href };
    });
    if (!first) return []; // 첫 초점이 문서 내 앵커가 아니면 이 규칙의 대상이 아니다(k-skip-link-first가 다룸)

    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);

    const targetId = first.href.slice(1);
    const moved = await page.evaluate((id) => {
      const target = document.getElementById(id);
      return target !== null && document.activeElement === target;
    }, targetId);

    if (moved) return [];
    return [
      createFinding(rule, null, {
        message: bSkipLinkWorks.message,
        fix: bSkipLinkWorks.fix,
        outcome: "fail",
        selectorOverride: first.selector,
        htmlOverride: first.html,
      }),
    ];
  },
};
