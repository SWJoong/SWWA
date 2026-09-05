import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * T-11 · 설치 스모크(배포 전 자동 게이트). 빌드된 dist/index.js를 실제 stdio MCP 서버로 기동해
 * initialize 핸드셰이크 + 전 표면(도구 7·프롬프트 2·리소스 6=정적 5+템플릿 1) 노출과 check_html
 * end-to-end 동작을 확인한다. CI는 test 전에 Build를 돌리므로 dist가 있고, 없을 때만 빌드한다.
 */
const dist = fileURLToPath(new URL("../../dist/index.js", import.meta.url));
const fixture = fileURLToPath(new URL("../fixtures/html/k-skip-link-first/fail.html", import.meta.url));

let client: Client;
let transport: StdioClientTransport;

beforeAll(async () => {
  if (!existsSync(dist)) execSync("npm run build", { stdio: "ignore" });
  transport = new StdioClientTransport({ command: "node", args: [dist] });
  client = new Client({ name: "smoke", version: "0.0.0" });
  await client.connect(transport);
}, 30_000);

afterAll(async () => {
  await client?.close();
});

describe("설치 스모크 (빌드 dist stdio 기동, T-11)", () => {
  it("TC-SMOKE-01: initialize 후 serverInfo.name이 swwa다", () => {
    expect(client.getServerVersion()?.name).toBe("swwa");
  });

  it("TC-SMOKE-02: 도구 7종이 노출된다", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    for (const n of [
      "lookup_checkpoint",
      "get_checklist",
      "check_html",
      "check_contrast",
      "audit_url",
      "browser_status",
      "estimate_cert_readiness",
    ]) {
      expect(names).toContain(n);
    }
  });

  it("TC-SMOKE-03: 프롬프트 2종이 노출된다", async () => {
    const { prompts } = await client.listPrompts();
    const names = prompts.map((p) => p.name);
    expect(names).toContain("review-markup");
    expect(names).toContain("audit-report");
  });

  it("TC-SMOKE-04: 리소스 6종(정적 5 + 템플릿 1)이 노출된다", async () => {
    const { resources } = await client.listResources();
    const uris = resources.map((r) => r.uri);
    for (const u of [
      "swwa://kwcag22",
      "swwa://mapping/wcag22",
      "swwa://certification",
      "swwa://mobile-app-2.0",
      "swwa://sources",
    ]) {
      expect(uris).toContain(u);
    }
    const { resourceTemplates } = await client.listResourceTemplates();
    expect(resourceTemplates.map((t) => t.uriTemplate)).toContain("swwa://kwcag22/{id}");
  });

  it("TC-SMOKE-05: check_html가 실 자산으로 end-to-end 동작한다", async () => {
    const res = await client.callTool({ name: "check_html", arguments: { path: fixture } });
    const report = res.structuredContent as { verdict: string; checkpoints: { id: string; status: string }[] };
    expect(report.checkpoints.length).toBe(33);
    expect(report.checkpoints.find((c) => c.id === "6.4.1")?.status).toBe("fail");
  }, 15_000);

  it("TC-SMOKE-06: swwa://kwcag22/{id} 템플릿 리소스를 읽을 수 있다", async () => {
    const res = await client.readResource({ uri: "swwa://kwcag22/6.4.1" });
    const text = (res.contents[0] as { text?: string }).text ?? "";
    expect(text).toContain("반복 영역 건너뛰기");
  });
});
