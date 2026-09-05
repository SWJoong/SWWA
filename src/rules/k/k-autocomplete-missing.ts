import { createFinding } from "../../normalize/finding.js";
import { autocompleteMissing } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

// 개인정보 입력으로 보이는 필드의 힌트(name·id·type·placeholder). 매칭되면 autocomplete 권장.
const FIELD_HINTS: { label: string; pattern: RegExp }[] = [
  { label: "이름", pattern: /name|이름|성명|fname|lname|firstname|lastname/i },
  { label: "이메일", pattern: /email|이메일|메일/i },
  { label: "전화", pattern: /tel|phone|mobile|전화|휴대|연락처/i },
  { label: "주소", pattern: /address|addr|주소|우편|zip|postal/i },
];

const EXEMPT_TYPES = new Set(["hidden", "checkbox", "radio", "button", "submit", "reset", "file", "range", "color"]);

export const rule: StaticRule = {
  id: "k-autocomplete-missing",
  kwcag: "7.3.4",
  wcag: ["3.3.7"],
  engine: "k",
  impact: "minor",
  confidence: "low",
  tier: "T2",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const el of Array.from(ctx.document.querySelectorAll("input, select"))) {
      const type = (el.getAttribute("type") ?? "text").toLowerCase();
      if (el.tagName.toLowerCase() === "input" && EXEMPT_TYPES.has(type)) continue;
      if ((el.getAttribute("autocomplete") ?? "").trim() !== "") continue;
      const marker = `${el.getAttribute("name") ?? ""} ${el.getAttribute("id") ?? ""} ${type} ${el.getAttribute("placeholder") ?? ""}`;
      const hit = FIELD_HINTS.find((h) => h.pattern.test(marker));
      if (hit) {
        findings.push(
          createFinding(rule, el, { message: autocompleteMissing.message(hit.label), fix: autocompleteMissing.fix, outcome: "incomplete" }),
        );
      }
    }
    return findings;
  },
};
