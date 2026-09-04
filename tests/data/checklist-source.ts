// kwcag22-checklist.md(단일 소스, ADR-04)를 파싱해 데이터 테스트에서 대조 기준으로 쓴다.
// 이 파일은 테스트 전용 헬퍼다 — src/에 두지 않는다(런타임은 assets/kwcag22.json만 읽는다).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CHECKLIST_PATH = fileURLToPath(
  new URL("../../skills/kwcag-guide/references/kwcag22-checklist.md", import.meta.url),
);

export type Automation = "auto" | "assist" | "manual" | "na";

export interface ChecklistSourceRow {
  id: string;
  alias: string;
  name: string;
  requirement: string;
  newIn22: boolean;
  wcag: string[];
  axeRules: string[];
  ownRules: string[];
  automation: Automation;
}

const GRADE_MAP: Record<string, Automation> = {
  자동: "auto",
  보조: "assist",
  수동: "manual",
  "N/A": "na",
};

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

/** 괄호 안의 쉼표는 무시하고 최상위 쉼표에서만 나눈다("k-foo (T2: a, b), k-bar" → 2건). */
function splitTopLevel(cell: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of cell) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
}

function parseIdAlias(cell: string): { id: string; alias: string } {
  const match = /^(\d\.\d\.\d)\s*\((\d\.\d\.\d)\)$/.exec(cell);
  if (!match) throw new Error(`ID(별칭) 셀 형식이 아닙니다: "${cell}"`);
  const [, id, alias] = match as unknown as [string, string, string];
  return { id, alias };
}

/**
 * "no-autoplay-audio(브라우저)" → "no-autoplay-audio". "—" → [].
 * 일부 셀은 규칙이 아니라 도구 참조다(예: "`check_contrast` 도구(정적 색상 쌍)") — 백틱 안
 * 토큰을 그대로 식별자로 취급한다(axe 규칙 목록과는 어차피 대조하지 않는 열이라 관대하게 둔다).
 */
function parseRuleList(cell: string): string[] {
  if (cell === "—" || cell === "") return [];
  return splitTopLevel(cell)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry): string | null => {
      // 괄호로만 시작하는 항목은 백로그 메모다(예: "(`audit_site` 백로그: …)") — 실제 규칙이 아니다.
      if (entry.startsWith("(")) return null;
      // 도구 참조는 백틱으로 시작한다(예: "`check_contrast` 도구…"). 설명 중간의 인라인 코드는 무시.
      const leadingBacktick = /^`([^`]+)`/.exec(entry);
      if (leadingBacktick) return leadingBacktick[1] as string;
      const idMatch = /^[a-zA-Z0-9-]+/.exec(entry);
      if (!idMatch) throw new Error(`규칙 ID를 추출할 수 없습니다: "${entry}"`);
      return idMatch[0];
    })
    .filter((id): id is string => id !== null);
}

function parseAutomation(cell: string): Automation {
  const word = /^(자동|보조|수동|N\/A)/.exec(cell)?.[1];
  if (!word || !(word in GRADE_MAP)) {
    throw new Error(`등급 셀을 해석할 수 없습니다: "${cell}"`);
  }
  return GRADE_MAP[word] as Automation;
}

function parseWcagList(cell: string): string[] {
  if (cell === "—" || cell.startsWith("—")) return [];
  // "1.2.1, 1.2.2, 1.2.3" · "2.4.3, 2.4.7" · "2.4.2 (2.4.6 참고)" 등에서 SC 번호만 뽑는다.
  const matches = cell.match(/\d\.\d{1,2}\.\d{1,2}/g);
  return matches ?? [];
}

/**
 * §3(요구 문장)과 §4(규칙 카탈로그) 표를 파싱해 ID 기준으로 병합한다.
 * 두 표의 행 순서·개수가 다르면(추가·누락) 명시적으로 던진다 — 침묵하는 실패를 피한다.
 */
export function parseChecklistSource(): ChecklistSourceRow[] {
  const text = readFileSync(CHECKLIST_PATH, "utf8");
  const lines = text.split(/\r?\n/);

  const idRowPattern = /^\|\s*\d\.\d\.\d\s*\(\d\.\d\.\d\)\s*\|/;

  // §3: "## 3." 섹션 헤더 다음, "## 4."가 나오기 전까지의 표 행.
  const sec3Start = lines.findIndex((l) => l.startsWith("## 3."));
  const sec4Start = lines.findIndex((l) => l.startsWith("## 4."));
  const sec5Start = lines.findIndex((l) => l.startsWith("## 5."));
  if (sec3Start < 0 || sec4Start < 0 || sec5Start < 0) {
    throw new Error("kwcag22-checklist.md의 §3/§4/§5 헤더를 찾지 못했습니다(문서 구조 변경?).");
  }

  const sec3Rows = lines.slice(sec3Start, sec4Start).filter((l) => idRowPattern.test(l));
  const sec4Rows = lines.slice(sec4Start, sec5Start).filter((l) => idRowPattern.test(l));

  const requirementById = new Map<
    string,
    { alias: string; name: string; requirement: string; newIn22: boolean }
  >();
  for (const line of sec3Rows) {
    const cells = splitRow(line);
    const [idCell, name, requirement, newMark] = cells as [string, string, string, string?];
    const { id, alias } = parseIdAlias(idCell);
    requirementById.set(id, {
      alias,
      name,
      requirement,
      newIn22: (newMark ?? "").includes("✅"),
    });
  }

  const rows: ChecklistSourceRow[] = [];
  for (const line of sec4Rows) {
    const cells = splitRow(line);
    const [idCell, , wcagCell, axeCell, ownCell, gradeCell] = cells as [
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    const { id, alias } = parseIdAlias(idCell);
    const req = requirementById.get(id);
    if (!req) throw new Error(`§4에 있지만 §3에 없는 검사항목: ${id}`);
    rows.push({
      id,
      alias,
      name: req.name,
      requirement: req.requirement,
      newIn22: req.newIn22,
      wcag: parseWcagList(wcagCell),
      axeRules: parseRuleList(axeCell),
      ownRules: parseRuleList(ownCell),
      automation: parseAutomation(gradeCell),
    });
  }

  if (rows.length !== requirementById.size) {
    throw new Error(
      `§3(${requirementById.size}건)과 §4(${rows.length}건)의 검사항목 수가 다릅니다.`,
    );
  }

  return rows;
}

function readChecklistText(): string {
  return readFileSync(CHECKLIST_PATH, "utf8");
}

/** "등급 집계: 자동 7 · 보조 17 · 수동 8 · N/A 1 = 33" 줄을 파싱한다. */
export function parseGradeSummaryLine(): Record<Automation, number> {
  const text = readChecklistText();
  const line = text.split(/\r?\n/).find((l) => l.startsWith("등급 집계:"));
  if (!line) throw new Error("kwcag22-checklist.md에서 '등급 집계:' 요약 줄을 찾지 못했습니다.");
  const match = /자동\s*(\d+)\s*·\s*보조\s*(\d+)\s*·\s*수동\s*(\d+)\s*·\s*N\/A\s*(\d+)/.exec(line);
  if (!match) throw new Error(`등급 집계 줄 형식을 해석할 수 없습니다: "${line}"`);
  const [, auto, assist, manual, na] = match as unknown as [string, string, string, string, string];
  return { auto: Number(auto), assist: Number(assist), manual: Number(manual), na: Number(na) };
}

/** §5(규칙 ID 목록)의 T1/T2/B 불릿에서 규칙 ID를 뽑는다. */
export function parseRuleCatalog(): { t1: string[]; t2: string[]; b: string[] } {
  const lines = readChecklistText().split(/\r?\n/);
  const extract = (prefix: string): string[] => {
    const line = lines.find((l) => l.startsWith(`- **${prefix}`));
    if (!line) throw new Error(`kwcag22-checklist.md §5에서 "${prefix}" 목록을 찾지 못했습니다.`);
    const afterColon = line.split("**: ")[1];
    if (!afterColon) throw new Error(`"${prefix}" 목록 줄 형식을 해석할 수 없습니다: "${line}"`);
    return afterColon
      .split("·")
      .map((entry) => entry.trim())
      .map((entry) => /[kb]-[a-zA-Z0-9-]+/.exec(entry)?.[0])
      .filter((id): id is string => Boolean(id));
  };
  return { t1: extract("T1"), t2: extract("T2"), b: extract("B") };
}
