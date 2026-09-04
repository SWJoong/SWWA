import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DataBundle } from "../data/loader.js";
import type { Checkpoint } from "../data/kwcag22.js";

const COMPONENTS = [
  "form", "table", "image", "media", "link", "navigation", "modal", "carousel", "auth", "iframe", "widget",
] as const;

interface ChecklistItem {
  kwcag: string;
  alias: string;
  question: string;
  how: string;
  evidence: string;
}

function toItem(cp: Checkpoint): ChecklistItem {
  return {
    kwcag: cp.id,
    alias: cp.alias,
    question: `${cp.name_ko} — ${cp.summary_ko}`,
    how: cp.testMethod_ko.join(" "),
    evidence: cp.passExamples_ko.join(" / ") || cp.commonErrors_ko.join(" / "),
  };
}

/** 장애 유형별 사용자 평가 과업 예시(§3.1 get_checklist scope=user-eval). kwcag22.json과 별개로
 * 이 도구가 직접 관리하는 소규모 큐레이션 데이터다 — 검사항목 자동화 등급표와는 성격이 다르다. */
const USER_EVAL_TASKS: { category: string; kwcag: string; task: string; how: string; evidence: string }[] = [
  { category: "시각", kwcag: "7.3.2", task: "스크린리더만으로 로그인 폼을 작성한다", how: "NVDA/VoiceOver로 각 입력 필드의 레이블이 읽히는지 확인", evidence: "모든 필드에서 레이블 음성 안내 성공" },
  { category: "시각", kwcag: "6.4.1", task: "스크린리더 사용자가 반복 메뉴를 건너뛰어 본문으로 바로 이동한다", how: "첫 Tab에서 본문 바로가기 링크로 이동 후 Enter", evidence: "본문 영역으로 초점 이동 확인" },
  { category: "청각", kwcag: "5.2.1", task: "소리를 끄고 자막만으로 강의 영상 내용을 이해한다", how: "음소거 상태로 영상 시청, 자막과 음성 내용 비교", evidence: "자막만으로 핵심 내용 파악 가능" },
  { category: "지체", kwcag: "6.1.1", task: "마우스 없이 키보드만으로 전체 기능을 사용한다", how: "Tab/Shift+Tab/Enter/Space만으로 주요 과업 수행", evidence: "모든 기능에 키보드로 도달·실행 가능" },
  { category: "지체", kwcag: "6.1.2", task: "키보드로 이동하며 현재 초점 위치를 항상 시각적으로 확인한다", how: "Tab 이동마다 초점 표시(윤곽선 등) 육안 확인", evidence: "모든 초점 가능 요소에서 표시 확인" },
  { category: "인지", kwcag: "7.3.1", task: "입력 오류 메시지만 보고 무엇을 고쳐야 하는지 이해한다", how: "일부러 잘못된 값을 입력해 오류 메시지 확인", evidence: "구체적인 정정 방법이 안내됨" },
  { category: "인지", kwcag: "7.3.4", task: "이전 단계에서 입력한 정보를 다시 입력하지 않고 진행한다", how: "다단계 폼에서 배송지 등 반복 정보 자동완성 확인", evidence: "재입력 없이 다음 단계 진행 가능" },
];

function buildMarkdown(scope: string, items: ChecklistItem[]): string {
  const rows = items
    .map((item) => `- [ ] **${item.kwcag}(${item.alias})** ${item.question}\n  - 확인 방법: ${item.how}\n  - 근거: ${item.evidence}`)
    .join("\n");
  return `# 체크리스트 (${scope})\n\n${rows || "(해당하는 항목이 없습니다)"}`;
}

export function registerChecklistTool(server: McpServer, data: DataBundle): void {
  server.registerTool(
    "get_checklist",
    {
      title: "KWCAG 체크리스트 생성",
      description: "검사항목·컴포넌트·페이지 전체·사용자 평가 스코프로 KWCAG 2.2 체크리스트를 만든다.",
      inputSchema: {
        scope: z.enum(["checkpoint", "component", "page", "user-eval"]),
        id: z.string().min(1).optional().describe("scope=checkpoint일 때 필수(KWCAG ID 또는 별칭)"),
        component: z.enum(COMPONENTS).optional().describe("scope=component일 때 필수"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({ scope, id, component }) => {
      if (scope === "checkpoint") {
        if (!id) {
          return {
            isError: true,
            content: [{ type: "text", text: "scope=checkpoint에는 id가 필요합니다." }],
            structuredContent: { code: "E_INPUT" },
          };
        }
        const cp = data.kwcag22.findById(id);
        const items = cp ? [toItem(cp)] : [];
        return {
          content: [{ type: "text", text: buildMarkdown(scope, items) }],
          structuredContent: { scope, items },
        };
      }

      if (scope === "component") {
        if (!component) {
          return {
            isError: true,
            content: [{ type: "text", text: "scope=component에는 component가 필요합니다." }],
            structuredContent: { code: "E_INPUT" },
          };
        }
        const items = data.kwcag22.checkpoints
          .filter((cp) => cp.components.includes(component))
          .map(toItem);
        return {
          content: [{ type: "text", text: buildMarkdown(scope, items) }],
          structuredContent: { scope, items },
        };
      }

      if (scope === "page") {
        const items = data.kwcag22.checkpoints.map(toItem);
        return {
          content: [{ type: "text", text: buildMarkdown(scope, items) }],
          structuredContent: { scope, items },
        };
      }

      // scope === "user-eval"
      const items = USER_EVAL_TASKS.map((t) => ({
        kwcag: t.kwcag,
        alias: data.kwcag22.findById(t.kwcag)?.alias ?? t.kwcag,
        question: `[${t.category}] ${t.task}`,
        how: t.how,
        evidence: t.evidence,
      }));
      return {
        content: [{ type: "text", text: buildMarkdown(scope, items) }],
        structuredContent: { scope, items },
      };
    },
  );
}
