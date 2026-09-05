import { createFinding } from "../../normalize/finding.js";
import { bFocusVisible } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { BrowserContext, BrowserRule } from "../types.js";

const MAX_STOPS = 50;

export const rule: BrowserRule = {
  id: "b-focus-visible",
  kwcag: "6.1.2",
  wcag: ["2.4.7"],
  engine: "b",
  impact: "serious",
  confidence: "high",
  tier: "B",
  async run(ctx: BrowserContext): Promise<Finding[]> {
    const { page } = ctx;

    const baseline = await page.evaluate(() => {
      const map: Record<string, string> = {};
      Array.from(document.querySelectorAll("*")).forEach((el, i) => {
        el.setAttribute("data-swwa-order", String(i));
        const cs = getComputedStyle(el);
        map[i] = [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.borderColor, cs.backgroundColor].join("|");
      });
      return map;
    });

    const findings: Finding[] = [];
    const seen = new Set<number>();

    for (let i = 0; i < MAX_STOPS; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active || active === document.body) return null;
        const idx = Number(active.getAttribute("data-swwa-order") ?? "-1");
        const cs = getComputedStyle(active);
        const style = [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.borderColor, cs.backgroundColor].join("|");
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
        return { idx, style, selector: cssPath(active), html: active.outerHTML.slice(0, 300) };
      });
      if (!info || info.idx < 0) break;
      if (seen.has(info.idx)) break;
      seen.add(info.idx);

      const before = baseline[String(info.idx)];
      if (before === info.style) {
        findings.push(
          createFinding(rule, null, {
            message: bFocusVisible.message,
            fix: bFocusVisible.fix,
            outcome: "fail",
            selectorOverride: info.selector,
            htmlOverride: info.html,
          }),
        );
      }
    }

    await page.evaluate(() => {
      document.querySelectorAll("[data-swwa-order]").forEach((el) => el.removeAttribute("data-swwa-order"));
    });

    return findings;
  },
};
