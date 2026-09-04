import { readFileSync } from "node:fs";
import { z } from "zod";

const overrideSchema = z.object({
  kwcag: z.string().regex(/^\d\.\d\.\d$/).nullable().optional(),
  staticDisabled: z.boolean().optional(),
});

const axeRuleMapSchema = z.record(z.string(), overrideSchema);

export type AxeRuleOverride = z.infer<typeof overrideSchema>;
export type AxeRuleMap = Record<string, AxeRuleOverride>;

function formatIssues(issues: readonly { path: PropertyKey[]; message: string }[]): string {
  return issues
    .slice(0, 8)
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

export function parseAxeMap(data: unknown): AxeRuleMap {
  const result = axeRuleMapSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`axe-rule-map.json 검증에 실패했습니다:\n${formatIssues(result.error.issues)}`);
  }
  return result.data;
}

export function loadAxeMap(): AxeRuleMap {
  const url = new URL("../../assets/axe-rule-map.json", import.meta.url);
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(url, "utf8"));
  } catch {
    throw new Error(`axe-rule-map.json을 읽을 수 없습니다: ${decodeURIComponent(url.pathname)}`);
  }
  return parseAxeMap(json);
}
