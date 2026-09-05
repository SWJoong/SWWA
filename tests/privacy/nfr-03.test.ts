import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * NFR-03 · 무로깅(입력 프라이버시). stdout은 JSON-RPC 채널이라 로그 금지, 로그는 stderr만 —
 * 입력 HTML 본문·스택은 싣지 않는다(03 §9). 빌드 dist를 stdio로 기동해 stderr를 캡처하고, 입력에
 * 넣은 센티넬이 stderr에 나타나지 않으며 오류 응답에 스택이 없음을 단정한다.
 */
const dist = fileURLToPath(new URL("../../dist/index.js", import.meta.url));
const SENTINEL = "카나리아센티넬X7Q";

let client: Client;
let transport: StdioClientTransport;
let stderrBuf = "";

beforeAll(async () => {
  if (!existsSync(dist)) execSync("npm run build", { stdio: "ignore" });
  transport = new StdioClientTransport({ command: "node", args: [dist], stderr: "pipe" });
  transport.stderr?.on("data", (d: Buffer) => (stderrBuf += d.toString("utf8")));
  client = new Client({ name: "nfr03", version: "0.0.0" });
  await client.connect(transport);
}, 30_000);

afterAll(async () => {
  await client?.close();
});

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 100));

describe("NFR-03 무로깅 — 입력 프라이버시 (빌드 dist stdio)", () => {
  it("TC-PRIV-01: check_html 입력 HTML 본문이 stderr 로그에 남지 않는다", async () => {
    await client.callTool({
      name: "check_html",
      arguments: { html: `<!doctype html><html lang="ko"><head><title>${SENTINEL}</title></head><body><p>${SENTINEL} 본문</p></body></html>` },
    });
    await flush();
    expect(stderrBuf).not.toContain(SENTINEL);
  }, 15_000);

  it("TC-PRIV-02: 정상 check_html 호출은 stderr 로그를 새로 만들지 않는다", async () => {
    const before = stderrBuf.length;
    await client.callTool({
      name: "check_html",
      arguments: { html: `<!doctype html><html lang="ko"><head><title>${SENTINEL}2</title></head><body>내용</body></html>` },
    });
    await flush();
    expect(stderrBuf.length).toBe(before);
  }, 15_000);

  it("TC-PRIV-03: 오류 응답에 스택 트레이스가 없고 structuredContent는 코드만 담는다", async () => {
    const res = await client.callTool({ name: "check_html", arguments: {} });
    expect(res.isError).toBe(true);
    const sc = res.structuredContent as Record<string, unknown>;
    expect(sc).toEqual({ code: "E_INPUT" });
    const text = (res.content as { type: string; text?: string }[])[0]?.text ?? "";
    expect(text).not.toMatch(/\n\s*at /); // "at file:..." 스택 프레임 없음
  });

  it("TC-PRIV-04: audit_url 오류(차단 호스트) 응답에도 스택·내부 경로가 없다", async () => {
    const res = await client.callTool({
      name: "audit_url",
      arguments: { url: "http://169.254.169.254/latest/meta-data/" },
    });
    expect(res.isError).toBe(true);
    expect((res.structuredContent as { code: string }).code).toBe("E_BLOCKED_URL");
    const text = (res.content as { type: string; text?: string }[])[0]?.text ?? "";
    expect(text).not.toMatch(/\n\s*at /);
  });
});
