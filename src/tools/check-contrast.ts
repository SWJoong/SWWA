import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { evaluateContrast } from "../color/contrast.js";

function errorResult(code: string, message: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
    structuredContent: { code },
  };
}

export function registerCheckContrastTool(server: McpServer): void {
  server.registerTool(
    "check_contrast",
    {
      title: "명도 대비 계산",
      description: "두 색상 사이의 명도 대비를 계산하고 KWCAG 5.4.3(1.4.3) 기준 통과 여부를 판정한다.",
      inputSchema: {
        foreground: z.string().describe("전경(텍스트) 색. hex/rgb()/rgba()/hsl()/hsla()/CSS 색 이름"),
        background: z.string().describe("배경 색. hex/rgb()/rgba()/hsl()/hsla()/CSS 색 이름"),
        fontSizePx: z.number().positive().default(16),
        bold: z.boolean().default(false),
      },
      outputSchema: {
        ratio: z.number(),
        largeText: z.boolean(),
        aa: z.enum(["pass", "fail"]),
        aaa: z.enum(["pass", "fail"]),
        kwcag: z.literal("5.4.3"),
        alias: z.literal("1.4.3"),
        threshold: z.number(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({ foreground, background, fontSizePx, bold }) => {
      let evaluation;
      try {
        evaluation = evaluateContrast(foreground, background, fontSizePx, bold);
      } catch (err) {
        return errorResult("E_INPUT", err instanceof Error ? err.message : "색상 값을 해석할 수 없습니다.");
      }
      const structuredContent = {
        ratio: Math.round(evaluation.ratio * 100) / 100,
        largeText: evaluation.largeText,
        aa: evaluation.aa,
        aaa: evaluation.aaa,
        kwcag: "5.4.3" as const,
        alias: "1.4.3" as const,
        threshold: evaluation.threshold,
      };
      return {
        content: [
          {
            type: "text" as const,
            text: `대비 ${structuredContent.ratio}:1 · AA ${structuredContent.aa} · AAA ${structuredContent.aaa} (5.4.3/1.4.3)`,
          },
        ],
        structuredContent,
      };
    },
  );
}
