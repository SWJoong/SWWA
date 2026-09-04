import { parse } from "parse5";
import { parseErrors as parseErrorMessages } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

const WHITELIST = new Set(Object.keys(parseErrorMessages));

export const rule: StaticRule = {
  id: "k-parse-errors",
  kwcag: "8.1.1",
  wcag: ["4.1.1"],
  engine: "k",
  impact: "minor",
  confidence: "high",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    parse(ctx.html, {
      sourceCodeLocationInfo: true,
      onParseError: (error) => {
        if (!WHITELIST.has(error.code)) return; // 무해한 코드(트레일링 슬래시 등)는 제외
        const info = parseErrorMessages[error.code];
        findings.push({
          ruleId: rule.id,
          engine: "k-rule",
          kwcag: rule.kwcag,
          wcag: rule.wcag,
          impact: rule.impact,
          outcome: "fail",
          confidence: rule.confidence,
          selector: `L${error.startLine}:C${error.startCol}`,
          html: "",
          message: info?.message ?? `마크업 오류: ${error.code}`,
          fix: info?.fix ?? "마크업을 표준에 맞게 수정하세요.",
        });
      },
    });
    return findings;
  },
};
