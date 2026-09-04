import { readFileSync } from "node:fs";
import { z } from "zod";

const linkTextSchema = z.object({
  generic: z.array(z.string().min(1)),
  generic_prefix: z.array(z.string().min(1)),
});

const altTextSchema = z.object({
  meaningless: z.array(z.string().min(1)),
  filenamePattern: z.string().min(1),
});

export type LinkTextWordlist = z.infer<typeof linkTextSchema>;
export type AltTextWordlist = z.infer<typeof altTextSchema>;

export interface Wordlists {
  linkText: LinkTextWordlist;
  altText: AltTextWordlist;
}

function formatIssues(issues: readonly { path: PropertyKey[]; message: string }[]): string {
  return issues
    .slice(0, 8)
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

function readJson(relativePath: string): unknown {
  const url = new URL(relativePath, import.meta.url);
  try {
    return JSON.parse(readFileSync(url, "utf8"));
  } catch {
    throw new Error(`데이터 파일을 읽을 수 없습니다: ${decodeURIComponent(url.pathname)}`);
  }
}

export function parseWordlists(linkTextData: unknown, altTextData: unknown): Wordlists {
  const linkResult = linkTextSchema.safeParse(linkTextData);
  if (!linkResult.success) {
    throw new Error(`link-text-ko.json 검증에 실패했습니다:\n${formatIssues(linkResult.error.issues)}`);
  }
  const altResult = altTextSchema.safeParse(altTextData);
  if (!altResult.success) {
    throw new Error(`alt-text-ko.json 검증에 실패했습니다:\n${formatIssues(altResult.error.issues)}`);
  }
  return { linkText: linkResult.data, altText: altResult.data };
}

export function loadWordlists(): Wordlists {
  return parseWordlists(readJson("../../assets/link-text-ko.json"), readJson("../../assets/alt-text-ko.json"));
}
