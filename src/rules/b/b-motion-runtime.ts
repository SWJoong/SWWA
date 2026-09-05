import { createFinding } from "../../normalize/finding.js";
import { bMotionRuntime } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { BrowserContext, BrowserRule } from "../types.js";

const DEFAULT_OBSERVE_MS = 5000;
const MIN_MUTATIONS = 3;
const PAUSE_WORD_PATTERN = /정지|일시정지|멈춤|pause|stop/i;

export const rule: BrowserRule = {
  id: "b-motion-runtime",
  kwcag: "6.2.2",
  wcag: ["2.2.2"],
  engine: "b",
  impact: "moderate",
  confidence: "medium",
  tier: "B",
  async run(ctx: BrowserContext): Promise<Finding[]> {
    const { page } = ctx;
    const observeMs = ctx.motionObserveMs ?? DEFAULT_OBSERVE_MS;

    const mutationCount = await page.evaluate((ms) => {
      return new Promise<number>((resolve) => {
        let count = 0;
        const observer = new MutationObserver((mutations) => {
          count += mutations.length;
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(count);
        }, ms);
      });
    }, observeMs);

    if (mutationCount < MIN_MUTATIONS) return [];

    const hasPauseControl = await page.evaluate((patternSource) => {
      const pattern = new RegExp(patternSource, "i");
      const candidates = Array.from(document.querySelectorAll("button, [role='button'], a"));
      return candidates.some((el) => pattern.test(el.textContent ?? "") || pattern.test(el.getAttribute("aria-label") ?? ""));
    }, PAUSE_WORD_PATTERN.source);

    if (hasPauseControl) return [];

    return [
      createFinding(rule, null, {
        message: bMotionRuntime.message,
        fix: bMotionRuntime.fix,
        outcome: "fail",
        selectorOverride: "body",
        htmlOverride: "",
      }),
    ];
  },
};
