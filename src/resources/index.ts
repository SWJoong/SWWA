import { readFileSync } from "node:fs";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DataBundle } from "../data/loader.js";

function readAsset(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function certificationMarkdown(data: DataBundle): string {
  const c = data.certification;
  const criteriaLines = c.criteria
    .map((item) => `- **${item.kind}**: ${item.text}${item.needsVerification ? " (인증기관 공지로 재확인 필요)" : ""}`)
    .join("\n");
  const agencyLines = c.agencies.map((a) => `- ${a.name}${a.url ? ` (${a.url})` : ""}`).join("\n");
  return [
    `# 웹접근성 품질인증 절차·기준`,
    ``,
    `## 법적 근거`,
    ...c.legalBasis.map((l) => `- ${l.law} ${l.article}${l.needsVerification ? " (검증 필요)" : ""}`),
    ``,
    `## 기준`,
    criteriaLines,
    ``,
    `## 유효기간`,
    `- ${c.validity.text}`,
    ``,
    `## 절차`,
    c.procedure.map((step, i) => `${i + 1}. ${step}`).join("\n"),
    ``,
    `## 인증기관`,
    agencyLines,
    ``,
    `> 자동 검사 도구는 인증 심사를 대체하지 않습니다. 수치는 인증기관 공지로 최종 확인하세요.`,
  ].join("\n");
}

/** 도구 7·프롬프트 2와 별개로 지식 리소스 6종을 등록한다(02-architecture §3.3). */
export function registerResources(server: McpServer, data: DataBundle): void {
  server.registerResource(
    "kwcag22",
    "swwa://kwcag22",
    { description: "KWCAG 2.2 검사항목 33개 체크리스트(단일 소스 md 번들)", mimeType: "text/markdown" },
    () => ({
      contents: [
        { uri: "swwa://kwcag22", mimeType: "text/markdown", text: readAsset("../../assets/kwcag22-checklist.md") },
      ],
    }),
  );

  server.registerResource(
    "kwcag22-item",
    new ResourceTemplate("swwa://kwcag22/{id}", { list: undefined }),
    { description: "검사항목 1건 JSON(공식 번호·별칭 모두 허용)", mimeType: "application/json" },
    (uri, variables) => {
      const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
      const cp = id ? data.kwcag22.findById(id) : undefined;
      const text = JSON.stringify(cp ?? { error: `"${id}" 검사항목을 찾지 못했습니다.` }, null, 2);
      return { contents: [{ uri: uri.href, mimeType: "application/json", text }] };
    },
  );

  server.registerResource(
    "mapping-wcag22",
    "swwa://mapping/wcag22",
    { description: "WCAG 2.2 ↔ KWCAG 2.2 ↔ axe 규칙 매핑", mimeType: "application/json" },
    () => ({
      contents: [
        {
          uri: "swwa://mapping/wcag22",
          mimeType: "application/json",
          text: JSON.stringify({ wcag22: data.wcag22.criteria, axeRuleMap: data.axeRuleMap }, null, 2),
        },
      ],
    }),
  );

  server.registerResource(
    "certification",
    "swwa://certification",
    { description: "품질인증 절차·기준·기관(확인일·출처 포함)", mimeType: "text/markdown" },
    () => ({
      contents: [{ uri: "swwa://certification", mimeType: "text/markdown", text: certificationMarkdown(data) }],
    }),
  );

  server.registerResource(
    "mobile-app-2.0",
    "swwa://mobile-app-2.0",
    { description: "모바일 애플리케이션 콘텐츠 접근성 지침 2.0 요약", mimeType: "text/markdown" },
    () => ({
      contents: [
        { uri: "swwa://mobile-app-2.0", mimeType: "text/markdown", text: readAsset("../../assets/mobile-app-2.0.md") },
      ],
    }),
  );

  server.registerResource(
    "sources",
    "swwa://sources",
    { description: "출처·확인일·접근 상태·라이선스 메모", mimeType: "application/json" },
    () => ({
      contents: [
        { uri: "swwa://sources", mimeType: "application/json", text: JSON.stringify(data.sources, null, 2) },
      ],
    }),
  );
}
