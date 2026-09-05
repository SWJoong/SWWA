import { createFinding } from "../../normalize/finding.js";
import { gestureListener } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

// 다중 포인터·경로 기반 제스처 처리 흔적(인라인 핸들러 속성 + 인라인/헤드 스크립트 텍스트).
const GESTURE = /touchmove|ontouchmove|pointermove|onpointermove|gesturestart|gesturechange|pinch|swipe|hammer/i;

export const rule: StaticRule = {
  id: "k-gesture-listener",
  kwcag: "6.5.1",
  wcag: ["2.5.1"],
  engine: "k",
  impact: "moderate",
  confidence: "low",
  tier: "T2",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];

    // 1) 인라인 이벤트 핸들러 속성
    for (const el of Array.from(ctx.document.querySelectorAll("[ontouchmove],[onpointermove],[ongesturestart],[ongesturechange]"))) {
      findings.push(
        createFinding(rule, el, { message: gestureListener.message, fix: gestureListener.fix, outcome: "incomplete" }),
      );
    }

    // 2) 스크립트 텍스트(주입 안 함 — 문자열만 검사)
    for (const script of Array.from(ctx.document.querySelectorAll("script"))) {
      const code = script.textContent ?? "";
      if (code && GESTURE.test(code)) {
        findings.push(
          createFinding(rule, script, { message: gestureListener.message, fix: gestureListener.fix, outcome: "incomplete" }),
        );
        break; // 스크립트 다건 중복 방지
      }
    }
    return findings;
  },
};
