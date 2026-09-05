import { createFinding } from "../../normalize/finding.js";
import { onloadPopup } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

const WINDOW_OPEN = /window\.open\s*\(/;

export const rule: StaticRule = {
  id: "k-onload-popup",
  kwcag: "7.2.1",
  wcag: ["3.2.1"],
  engine: "k",
  impact: "moderate",
  confidence: "low",
  tier: "T2",
  run(ctx: StaticContext): Finding[] {
    // 1) <body onload="window.open(...)"> 등 인라인 로드 핸들러
    const bodyOnload = ctx.document.body?.getAttribute("onload") ?? "";
    if (WINDOW_OPEN.test(bodyOnload)) {
      return [createFinding(rule, ctx.document.body, { message: onloadPopup.message, fix: onloadPopup.fix, outcome: "incomplete" })];
    }
    // 2) 스크립트 텍스트에서 로드 시점 window.open (onload/DOMContentLoaded/즉시 실행 근처)
    for (const script of Array.from(ctx.document.querySelectorAll("script"))) {
      const code = script.textContent ?? "";
      if (!code || !WINDOW_OPEN.test(code)) continue;
      if (/onload|DOMContentLoaded|addEventListener\s*\(\s*['"]load['"]/.test(code) || /^\s*window\.open/m.test(code)) {
        return [createFinding(rule, script, { message: onloadPopup.message, fix: onloadPopup.fix, outcome: "incomplete" })];
      }
    }
    return [];
  },
};
