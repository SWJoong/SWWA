import { createFinding } from "../../normalize/finding.js";
import { bKeyboardReachable } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { BrowserContext, BrowserRule } from "../types.js";

const MAX_STOPS = 200;

export const rule: BrowserRule = {
  id: "b-keyboard-reachable",
  kwcag: "6.1.1",
  wcag: ["2.1.1"],
  engine: "b",
  impact: "critical",
  confidence: "high",
  tier: "B",
  async run(ctx: BrowserContext): Promise<Finding[]> {
    const { page } = ctx;

    const candidates = await page.evaluate(() => {
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
      const els = Array.from(document.querySelectorAll('[onclick], [role="button"], [role="link"]'));
      return els.map((el, i) => {
        el.setAttribute("data-swwa-cand", String(i));
        return { idx: i, selector: cssPath(el), html: el.outerHTML.slice(0, 300) };
      });
    });
    if (candidates.length === 0) return [];

    const reached = new Set<number>();
    const seenKeys = new Set<string>();
    for (let i = 0; i < MAX_STOPS; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active || active === document.body) return null;
        const cand = active.getAttribute("data-swwa-cand");
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
        return { key: `${cssPath(active)}|${active.tagName}`, cand: cand !== null ? Number(cand) : null };
      });
      if (!info) break;
      if (seenKeys.has(info.key)) break;
      seenKeys.add(info.key);
      if (info.cand !== null) reached.add(info.cand);
    }

    await page.evaluate(() => {
      document.querySelectorAll("[data-swwa-cand]").forEach((el) => el.removeAttribute("data-swwa-cand"));
    });

    return candidates
      .filter((c) => !reached.has(c.idx))
      .map((c) =>
        createFinding(rule, null, {
          message: bKeyboardReachable.message,
          fix: bKeyboardReachable.fix,
          outcome: "fail",
          selectorOverride: c.selector,
          htmlOverride: c.html,
        }),
      );
  },
};
