import { createFinding } from "../../normalize/finding.js";
import { normText } from "../util/text.js";
import { linkSameTextDiffHref } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-link-same-text-diff-href",
  kwcag: "6.4.3",
  wcag: ["2.4.4"],
  engine: "k",
  impact: "moderate",
  confidence: "low",
  tier: "T2",
  run(ctx: StaticContext): Finding[] {
    // 같은 (정규화된) 접근명 텍스트가 서로 다른 href를 가리키면 후보. aria-label로 구별되면 그 값을 이름으로 본다.
    const byText = new Map<string, { hrefs: Set<string>; first: Element }>();
    for (const a of Array.from(ctx.document.querySelectorAll("a[href]"))) {
      const name = normText(a.getAttribute("aria-label") ?? a.textContent ?? "");
      if (name === "") continue;
      const href = a.getAttribute("href") ?? "";
      const entry = byText.get(name);
      if (entry) {
        entry.hrefs.add(href);
      } else {
        byText.set(name, { hrefs: new Set([href]), first: a });
      }
    }
    const findings: Finding[] = [];
    for (const [name, entry] of byText) {
      if (entry.hrefs.size > 1) {
        findings.push(
          createFinding(rule, entry.first, {
            message: linkSameTextDiffHref.message(name),
            fix: linkSameTextDiffHref.fix,
            outcome: "incomplete",
          }),
        );
      }
    }
    return findings;
  },
};
