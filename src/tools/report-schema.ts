// check_html·audit_url이 공유하는 Report의 MCP outputSchema(zod raw shape). registerTool의
// outputSchema는 최상위 키의 zod 스키마 맵이어야 하므로 z.object로 감싸지 않고 그대로 export한다.
import { z } from "zod";

const findingSchema = z.object({
  ruleId: z.string(),
  engine: z.enum(["k-rule", "axe", "b-rule"]),
  kwcag: z.string().nullable(),
  wcag: z.array(z.string()),
  impact: z.enum(["critical", "serious", "moderate", "minor"]),
  outcome: z.enum(["fail", "incomplete"]),
  confidence: z.enum(["high", "medium", "low"]),
  selector: z.string(),
  html: z.string(),
  message: z.string(),
  fix: z.string(),
  helpUrl: z.string().optional(),
});

const checkpointResultSchema = z.object({
  id: z.string(),
  alias: z.string(),
  name: z.string(),
  automation: z.enum(["auto", "assist", "manual", "na"]),
  status: z.enum(["fail", "incomplete", "manual", "pass", "na"]),
  findings: z.number(),
});

export const reportOutputShape = {
  engine: z.object({
    name: z.literal("swwa"),
    version: z.string(),
    axe: z.string(),
    mode: z.enum(["static", "browser"]),
  }),
  target: z.object({ kind: z.enum(["html", "file", "url"]), ref: z.string(), title: z.string().optional() }),
  verdict: z.enum(["fail", "needs-review", "pass"]),
  summary: z.object({
    fail: z.number(),
    incomplete: z.number(),
    manual: z.number(),
    pass: z.number(),
    na: z.number(),
    byImpact: z.object({ critical: z.number(), serious: z.number(), moderate: z.number(), minor: z.number() }),
    truncated: z.boolean(),
  }),
  checkpoints: z.array(checkpointResultSchema),
  findings: z.array(findingSchema),
  manualChecklist: z.array(z.object({ kwcag: z.string(), alias: z.string(), question: z.string() })),
  notices: z.array(z.string()),
};
