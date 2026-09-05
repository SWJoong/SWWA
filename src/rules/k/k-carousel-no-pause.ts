import { createFinding } from "../../normalize/finding.js";
import { normText } from "../util/text.js";
import { carouselNoPause } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

const CAROUSEL_HINT = /carousel|slider|slick|swiper|롤링|배너|slide/i;
const PAUSE_HINT = /정지|일시정지|멈춤|pause|stop/i;

export const rule: StaticRule = {
  id: "k-carousel-no-pause",
  kwcag: "6.2.2",
  wcag: ["2.2.2"],
  engine: "k",
  impact: "moderate",
  confidence: "low",
  tier: "T2",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    const seen = new Set<Element>();
    for (const el of Array.from(ctx.document.querySelectorAll("[class],[id],[role]"))) {
      const marker = `${el.getAttribute("class") ?? ""} ${el.getAttribute("id") ?? ""} ${el.getAttribute("role") ?? ""}`;
      if (!CAROUSEL_HINT.test(marker)) continue;
      // 가장 바깥 캐러셀 컨테이너만(조상이 이미 잡혔으면 건너뜀)
      if (Array.from(seen).some((s) => s.contains(el))) continue;
      seen.add(el);
      const controlText = `${normText(el.textContent ?? "")} ${el.querySelectorAll("[aria-label]").length ? Array.from(el.querySelectorAll("[aria-label]")).map((c) => c.getAttribute("aria-label")).join(" ") : ""}`;
      if (!PAUSE_HINT.test(controlText)) {
        findings.push(
          createFinding(rule, el, { message: carouselNoPause.message, fix: carouselNoPause.fix, outcome: "incomplete" }),
        );
      }
    }
    return findings;
  },
};
