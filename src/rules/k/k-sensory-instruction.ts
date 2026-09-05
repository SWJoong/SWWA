import { createFinding } from "../../normalize/finding.js";
import { normText } from "../util/text.js";
import { sensoryInstruction } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

// 감각적 특성에만 의존한 지시어 후보(위치·모양·색). 지시 맥락("누르|클릭|선택|참고|보세요")과 함께
// 나타날 때만 후보로 본다 — 오탐을 줄이기 위한 저신뢰 휴리스틱이다.
const SENSORY = ["오른쪽", "왼쪽", "위쪽", "아래쪽", "위의", "아래의", "빨간", "파란", "초록", "동그란", "네모난", "둥근"];
const ACTION = /누르|클릭|선택|참고|보세요|이동/;

export const rule: StaticRule = {
  id: "k-sensory-instruction",
  kwcag: "5.3.3",
  wcag: ["1.3.3"],
  engine: "k",
  impact: "minor",
  confidence: "low",
  tier: "T2",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const el of Array.from(ctx.document.querySelectorAll("p, li, label, span, div, a, button"))) {
      if (el.children.length > 0) continue; // 텍스트 리프 노드만(중복 방지)
      const text = normText(el.textContent ?? "");
      if (text === "" || !ACTION.test(text)) continue;
      const hit = SENSORY.find((w) => text.includes(w));
      if (hit) {
        findings.push(
          createFinding(rule, el, { message: sensoryInstruction.message(hit), fix: sensoryInstruction.fix, outcome: "incomplete" }),
        );
      }
    }
    return findings;
  },
};
