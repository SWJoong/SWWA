import { readFileSync } from "node:fs";
import { z } from "zod";

const sourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().nullable(),
  accessedOn: z.string().min(1),
  status: z.enum(["ok", "needsVerification"]),
  license: z.string().min(1),
});

const sourcesFileSchema = z.object({
  sources: z.array(sourceSchema).min(1),
});

export type Source = z.infer<typeof sourceSchema>;
export type SourcesBundle = z.infer<typeof sourcesFileSchema>;

function formatIssues(issues: readonly { path: PropertyKey[]; message: string }[]): string {
  return issues
    .slice(0, 8)
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

export function parseSources(data: unknown): SourcesBundle {
  const result = sourcesFileSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`sources.json 검증에 실패했습니다:\n${formatIssues(result.error.issues)}`);
  }
  const seen = new Set<string>();
  for (const source of result.data.sources) {
    if (seen.has(source.id)) throw new Error(`출처 ID가 중복됩니다: ${source.id}`);
    seen.add(source.id);
  }
  return result.data;
}

export function loadSources(): SourcesBundle {
  const url = new URL("../../assets/sources.json", import.meta.url);
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(url, "utf8"));
  } catch {
    throw new Error(`sources.json을 읽을 수 없습니다: ${decodeURIComponent(url.pathname)}`);
  }
  return parseSources(json);
}
