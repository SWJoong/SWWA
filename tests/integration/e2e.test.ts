import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";
import { loadDataBundle } from "../../src/data/loader.js";

/**
 * T-11 · 통합 E2E(도구 조합). `claude --plugin-dir .`의 대화형 슬래시 커맨드 시나리오는 자동
 * 실행이 불가하므로(문서 docs/release/e2e-manual.md 참고), 여기서는 그 시나리오가 의존하는
 * 서버 도구 조합을 InMemory 트랜스포트로 end-to-end 검증한다.
 */
const data = loadDataBundle();
const fixture = (name: string): string =>
  readFileSync(fileURLToPath(new URL(`../fixtures/html/${name}`, import.meta.url)), "utf8");

async function connect(): Promise<{ client: Client; close: () => Promise<void> }> {
  const server = createServer(data);
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "e2e", version: "0" });
  await Promise.all([server.connect(st), client.connect(ct)]);
  return { client, close: async () => void (await Promise.all([client.close(), server.close()])) };
}

describe("통합 E2E — 도구 조합 (T-11)", () => {
  it("E2E-1(코드 리뷰): check_html → 6.4.1 fail·verdict fail", async () => {
    const { client, close } = await connect();
    try {
      const res = await client.callTool({
        name: "check_html",
        arguments: { html: fixture("k-skip-link-first/fail.html") },
      });
      const report = res.structuredContent as {
        verdict: string;
        checkpoints: { id: string; status: string }[];
        findings: unknown[];
      };
      expect(report.verdict).toBe("fail");
      expect(report.checkpoints.find((c) => c.id === "6.4.1")?.status).toBe("fail");
      expect(report.findings.length).toBeGreaterThan(0);
    } finally {
      await close();
    }
  });

  it("E2E-3(지식): lookup_checkpoint 2.4.1 → 6.4.1 매치 + WCAG 병기, get_checklist 동작", async () => {
    const { client, close } = await connect();
    try {
      const look = await client.callTool({ name: "lookup_checkpoint", arguments: { query: "2.4.1" } });
      const out = look.structuredContent as {
        matches: { id: string }[];
        relatedWcag: { sc: string }[];
      };
      expect(out.matches[0]?.id).toBe("6.4.1");
      expect(out.relatedWcag.some((w) => w.sc === "2.4.1")).toBe(true);

      const list = await client.callTool({
        name: "get_checklist",
        arguments: { scope: "checkpoint", id: "6.4.1" },
      });
      expect((list.structuredContent as { items: unknown[] }).items.length).toBe(1);
    } finally {
      await close();
    }
  });

  it("E2E-2(감사·인증): check_html ×2 → estimate_cert_readiness 집계", async () => {
    const { client, close } = await connect();
    try {
      const r1 = await client.callTool({ name: "check_html", arguments: { html: fixture("k-skip-link-first/fail.html") } });
      const r2 = await client.callTool({ name: "check_html", arguments: { html: fixture("k-skip-link-first/pass.html") } });
      const reports = [r1.structuredContent, r2.structuredContent];
      const cert = await client.callTool({ name: "estimate_cert_readiness", arguments: { reports } });
      const out = cert.structuredContent as {
        checkpoints: unknown[];
        overall: { pagesAudited: number };
        notices: string[];
      };
      expect(out.checkpoints.length).toBe(33);
      expect(out.overall.pagesAudited).toBe(2);
      expect(out.notices.join("\n")).toContain("판단할 수 없습니다");
    } finally {
      await close();
    }
  }, 15_000);

  it("E2E-프롬프트: review-markup·audit-report가 지시 메시지를 생성한다", async () => {
    const { client, close } = await connect();
    try {
      const rev = await client.getPrompt({ name: "review-markup", arguments: { html: "<img src=x>" } });
      expect(rev.messages[0]?.content.type).toBe("text");
      const aud = await client.getPrompt({
        name: "audit-report",
        arguments: { siteName: "테스트", reportJson: "{}" },
      });
      expect(aud.messages.length).toBeGreaterThan(0);
    } finally {
      await close();
    }
  });
});
