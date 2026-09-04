import { readFileSync } from "node:fs";
import { z } from "zod";

const criterionSchema = z.object({
  sc: z.string().min(1),
  name_en: z.string().min(1),
  name_ko: z.string().min(1),
  level: z.enum(["A", "AA", "AAA"]),
  since: z.string().min(1),
  kwcagIds: z.array(z.string().regex(/^\d\.\d\.\d$/)),
  removedIn: z.string().min(1).optional(),
  needsVerification: z.boolean().optional(),
});

const wcag22FileSchema = z.object({
  criteria: z.array(criterionSchema),
});

export type WcagCriterion = z.infer<typeof criterionSchema>;

export interface Wcag22Bundle {
  criteria: WcagCriterion[];
  findBySc(sc: string): WcagCriterion | undefined;
}

function formatIssues(issues: readonly { path: PropertyKey[]; message: string }[]): string {
  return issues
    .slice(0, 8)
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

export function parseWcag22(data: unknown): Wcag22Bundle {
  const result = wcag22FileSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`wcag22.json 검증에 실패했습니다:\n${formatIssues(result.error.issues)}`);
  }
  const bySc = new Map(result.data.criteria.map((c) => [c.sc, c] as const));
  return {
    criteria: result.data.criteria,
    findBySc: (sc) => bySc.get(sc),
  };
}

export function loadWcag22(): Wcag22Bundle {
  const url = new URL("../../assets/wcag22.json", import.meta.url);
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(url, "utf8"));
  } catch {
    throw new Error(`wcag22.json을 읽을 수 없습니다: ${decodeURIComponent(url.pathname)}`);
  }
  return parseWcag22(json);
}
