import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DataBundle } from "../data/loader.js";
import type { Checkpoint } from "../data/kwcag22.js";

const KWCAG_NUMBER = /^\d\.\d\.\d$/;

/** detail="summary"일 때 검사 방법·오류·통과 예시 필드를 생략한다(§3.1 lookup_checkpoint). */
function toMatch(cp: Checkpoint, detail: "summary" | "full"): Record<string, unknown> {
  if (detail === "full") return cp;
  const { testMethod_ko: _testMethod_ko, commonErrors_ko: _commonErrors_ko, passExamples_ko: _passExamples_ko, ...summary } = cp;
  return summary;
}

interface RelatedWcag {
  sc: string;
  name_ko: string;
  level: string;
  kwcagIds: string[];
}

function relatedWcagFor(data: DataBundle, sc: string): RelatedWcag[] {
  const criterion = data.wcag22.findBySc(sc);
  if (!criterion) return [];
  return [{ sc: criterion.sc, name_ko: criterion.name_ko, level: criterion.level, kwcagIds: criterion.kwcagIds }];
}

function findByAxeRule(data: DataBundle, ruleId: string): Checkpoint[] {
  return data.kwcag22.checkpoints.filter((cp) => cp.axeRules.includes(ruleId));
}

function findByKeyword(data: DataBundle, query: string): Checkpoint[] {
  const needle = query.trim();
  return data.kwcag22.checkpoints.filter(
    (cp) =>
      cp.name_ko.includes(needle) || cp.summary_ko.includes(needle) || cp.requirement_ko.includes(needle),
  );
}

/**
 * query 해석 우선순위(§3.1): "wcag:" 접두 → WCAG SC 직접 조회. 순수 숫자(X.X.X) → KWCAG
 * 별칭 우선 조회 + WCAG 해석을 relatedWcag로 병기(모호한 숫자, 예 "2.4.1"). axe 규칙 ID →
 * 귀속 검사항목. 그 외 → 이름·요약·요구문 부분 일치 키워드 검색.
 */
export function resolveQuery(
  data: DataBundle,
  query: string,
): { matches: Checkpoint[]; relatedWcag: RelatedWcag[] } {
  const trimmed = query.trim();

  if (trimmed.startsWith("wcag:")) {
    const sc = trimmed.slice("wcag:".length).trim();
    const criterion = data.wcag22.findBySc(sc);
    const matches = criterion
      ? data.kwcag22.checkpoints.filter((cp) => criterion.kwcagIds.includes(cp.id))
      : [];
    return { matches, relatedWcag: relatedWcagFor(data, sc) };
  }

  if (KWCAG_NUMBER.test(trimmed)) {
    const cp = data.kwcag22.findById(trimmed);
    return { matches: cp ? [cp] : [], relatedWcag: relatedWcagFor(data, trimmed) };
  }

  const byAxeRule = findByAxeRule(data, trimmed);
  if (byAxeRule.length > 0) return { matches: byAxeRule, relatedWcag: [] };

  return { matches: findByKeyword(data, trimmed), relatedWcag: [] };
}

export function registerLookupTool(server: McpServer, data: DataBundle): void {
  server.registerTool(
    "lookup_checkpoint",
    {
      title: "KWCAG 검사항목 조회",
      description:
        "KWCAG 2.2 검사항목 ID(공식 번호·별칭)·WCAG SC(wcag: 접두)·axe 규칙 ID·키워드로 검사항목을 조회한다.",
      inputSchema: {
        query: z.string().min(1).max(100).describe("검사항목 ID(6.4.1 또는 2.4.1), wcag:2.4.1, axe 규칙 ID, 키워드"),
        detail: z.enum(["summary", "full"]).default("summary"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({ query, detail }) => {
      const { matches, relatedWcag } = resolveQuery(data, query);
      const summary =
        matches.length === 0
          ? `"${query}"에 해당하는 검사항목을 찾지 못했습니다.`
          : matches.map((cp) => `- ${cp.id}(${cp.alias}) ${cp.name_ko} [${cp.automation}]`).join("\n");
      return {
        content: [{ type: "text", text: summary }],
        structuredContent: {
          matches: matches.map((cp) => toMatch(cp, detail)),
          relatedWcag,
        },
      };
    },
  );
}
