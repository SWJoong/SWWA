import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { detectBrowser } from "../engine/browser-detect.js";

export function registerBrowserStatusTool(server: McpServer): void {
  server.registerTool(
    "browser_status",
    {
      title: "브라우저 가용성 확인",
      description: "audit_url이 사용할 브라우저(Chrome→Edge→Playwright chromium)가 설치되어 있는지 확인한다. audit_url 호출 전에 먼저 확인하라.",
      inputSchema: {
        refresh: z.boolean().default(false).describe("true면 프로세스 내 캐시를 무시하고 다시 탐지"),
      },
      outputSchema: {
        available: z.boolean(),
        channel: z.enum(["chrome", "msedge", "chromium"]).nullable(),
        version: z.string().optional(),
        executablePath: z.string().optional(),
        installHint: z.string(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ refresh }) => {
      const status = await detectBrowser({ refresh });
      const summary = status.available
        ? `사용 가능: ${status.channel}${status.version ? ` ${status.version}` : ""}`
        : `사용 불가 — ${status.installHint}`;
      return {
        content: [{ type: "text" as const, text: summary }],
        structuredContent: { ...status },
      };
    },
  );
}
