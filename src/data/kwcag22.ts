import { readFileSync } from "node:fs";
import { z } from "zod";

const automationSchema = z.enum(["auto", "assist", "manual", "na"]);

const wcagRefSchema = z.object({
  sc: z.string().min(1),
  level: z.enum(["A", "AA", "AAA"]),
});

const checkpointSchema = z.object({
  id: z.string().regex(/^\d\.\d\.\d$/),
  alias: z.string().regex(/^\d\.\d\.\d$/),
  principle: z.object({
    no: z.number().int(),
    alias: z.number().int(),
    name: z.string().min(1),
  }),
  guideline: z.object({
    no: z.string().min(1),
    alias: z.string().min(1),
    name: z.string().min(1),
  }),
  name_ko: z.string().min(1),
  name_en: z.string().min(1).nullable(),
  requirement_ko: z.string().min(1),
  summary_ko: z.string().min(1),
  wcag: z.array(wcagRefSchema),
  automation: automationSchema,
  axeRules: z.array(z.string().min(1)),
  kRules: z.array(z.string().regex(/^k-/)),
  bRules: z.array(z.string().regex(/^b-/)),
  testMethod_ko: z.array(z.string().min(1)),
  commonErrors_ko: z.array(z.string().min(1)),
  passExamples_ko: z.array(z.string().min(1)),
  components: z.array(z.string()),
  newIn22: z.boolean(),
  sources: z.array(z.string().min(1)),
});

const kwcag22FileSchema = z.object({
  version: z.string().min(1),
  dataVersion: z.string().min(1),
  updatedAt: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).min(1),
  checkpoints: z.array(checkpointSchema),
});

export type Automation = z.infer<typeof automationSchema>;
export type Checkpoint = z.infer<typeof checkpointSchema>;

export interface Kwcag22Bundle {
  version: string;
  dataVersion: string;
  updatedAt: string;
  sourceIds: string[];
  checkpoints: Checkpoint[];
  /** 공식 번호(id) 또는 별칭(alias) 어느 쪽으로 조회해도 찾는다(§3.1 lookup_checkpoint). */
  findById(idOrAlias: string): Checkpoint | undefined;
}

function formatIssues(issues: readonly { path: PropertyKey[]; message: string }[]): string {
  return issues
    .slice(0, 8)
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

/**
 * 단일 소스(ADR-04)의 검사항목 수는 33개로 고정이다. zod 스키마와 별개로 여기서 강제해
 * assets/kwcag22.json 갱신 실수(누락·중복)를 기동 시점에 막는다.
 */
export function parseKwcag22(data: unknown): Kwcag22Bundle {
  const result = kwcag22FileSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`kwcag22.json 검증에 실패했습니다:\n${formatIssues(result.error.issues)}`);
  }
  const { checkpoints } = result.data;
  if (checkpoints.length !== 33) {
    throw new Error(`검사항목은 33개여야 하는데 ${checkpoints.length}개입니다.`);
  }
  const seen = new Set<string>();
  for (const cp of checkpoints) {
    if (seen.has(cp.id)) throw new Error(`검사항목 ID가 중복됩니다: ${cp.id}`);
    seen.add(cp.id);
  }
  const byId = new Map<string, Checkpoint>();
  for (const cp of checkpoints) {
    byId.set(cp.id, cp);
    byId.set(cp.alias, cp);
  }
  return {
    ...result.data,
    findById: (idOrAlias) => byId.get(idOrAlias),
  };
}

/** assets/kwcag22.json을 기동 시 1회 읽어 검증한다. 경로는 import.meta.url 기준(전역 설치·npx 모두 동작). */
export function loadKwcag22(): Kwcag22Bundle {
  const url = new URL("../../assets/kwcag22.json", import.meta.url);
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(url, "utf8"));
  } catch {
    throw new Error(`kwcag22.json을 읽을 수 없습니다: ${decodeURIComponent(url.pathname)}`);
  }
  return parseKwcag22(json);
}
