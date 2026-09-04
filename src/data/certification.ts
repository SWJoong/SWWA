import { readFileSync } from "node:fs";
import { z } from "zod";

const legalBasisSchema = z.object({
  law: z.string().min(1),
  article: z.string().min(1),
  note: z.string().min(1).optional(),
  needsVerification: z.boolean().optional(),
});

const criterionSchema = z.object({
  kind: z.enum(["expert", "user", "overall"]),
  text: z.string().min(1),
  value: z.number(),
  needsVerification: z.boolean().optional(),
  verifiedOn: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
});

const agencySchema = z.object({
  name: z.string().min(1),
  url: z.string().nullable().optional(),
  needsVerification: z.boolean().optional(),
});

const certificationFileSchema = z.object({
  legalBasis: z.array(legalBasisSchema),
  standard: z.object({ name: z.string().min(1), checkpoints: z.number().int() }),
  criteria: z.array(criterionSchema),
  validity: z.object({ text: z.string().min(1), needsVerification: z.boolean().optional() }),
  agencies: z.array(agencySchema),
  procedure: z.array(z.string().min(1)),
});

export type CertificationBundle = z.infer<typeof certificationFileSchema>;

function formatIssues(issues: readonly { path: PropertyKey[]; message: string }[]): string {
  return issues
    .slice(0, 8)
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

export function parseCertification(data: unknown): CertificationBundle {
  const result = certificationFileSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`certification.json 검증에 실패했습니다:\n${formatIssues(result.error.issues)}`);
  }
  return result.data;
}

export function loadCertification(): CertificationBundle {
  const url = new URL("../../assets/certification.json", import.meta.url);
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(url, "utf8"));
  } catch {
    throw new Error(`certification.json을 읽을 수 없습니다: ${decodeURIComponent(url.pathname)}`);
  }
  return parseCertification(json);
}
