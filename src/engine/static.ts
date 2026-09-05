import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import { JSDOM } from "jsdom";
import axeCore from "axe-core";
import { KRULES } from "../rules/registry.js";
import { normalizeAxeResults } from "../normalize/axe.js";
import { loadDataBundle } from "../data/loader.js";
import type { StaticContext } from "../rules/types.js";
import type { DataBundle } from "../data/loader.js";
import type { Finding } from "../report/types.js";

/** 렌더링이 필요해 정적(jsdom) 모드에서 판정할 수 없는 axe 규칙(02-architecture §3.1). */
export const STATIC_DISABLED_RULES = [
  "color-contrast",
  "color-contrast-enhanced",
  "link-in-text-block",
  "target-size",
  "scrollable-region-focusable",
  "no-autoplay-audio",
  "frame-tested",
  "css-orientation-lock",
];

export type Ruleset = "kwcag22" | "wcag22aa";

const TAGS: Record<Ruleset, string[]> = {
  kwcag22: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"],
  wcag22aa: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
};

const ENGINE_TIMEOUT_MS = 10_000;

export interface RunStaticOptions {
  html: string;
  baseUrl?: string;
  ruleset?: Ruleset;
  excludeRules?: string[];
  data: DataBundle;
  /** 하드 타임아웃(ms). 기본 10초. 워커 경로에서는 worker.terminate()로 강제 종료된다. */
  timeoutMs?: number;
}

/** 워커로 넘기는 직렬화 가능한 입력(DataBundle은 함수를 포함해 클론 불가 → 워커가 직접 로드한다). */
export type StaticWorkerInput = Pick<RunStaticOptions, "html" | "baseUrl" | "ruleset" | "excludeRules">;

export interface RunStaticResult {
  findings: Finding[];
  title?: string;
  notices: string[];
}

class EngineTimeoutError extends Error {}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new EngineTimeoutError("정적 검사 시간이 초과되었습니다.")), ms);
    }),
  ]);
}

export { EngineTimeoutError };

/**
 * jsdom + axe-core(ko) + k-규칙으로 정적 검사를 수행한다(03 §5). 페이지 <script>는 실행하지
 * 않고(runScripts: "outside-only") axe만 주입한다. 규칙별 실패는 개별 try/catch로 격리해
 * 한 규칙의 오류가 전체 리포트를 막지 않는다.
 *
 * 이 함수 자체는 하드 타임아웃을 갖지 않는다 — axe가 이벤트 루프를 동기적으로 점유하면
 * setTimeout이 선점하지 못하기 때문이다. 강제 종료 가능한 타임아웃은 워커에서 실행하는
 * `runStatic`이 담당한다(static-worker.ts).
 */
export async function runStaticCore(opts: RunStaticOptions): Promise<RunStaticResult> {
  const ruleset = opts.ruleset ?? "kwcag22";
  const dom = new JSDOM(opts.html, {
    url: opts.baseUrl ?? "http://localhost/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const notices: string[] = [];

  try {
    window.eval(axeCore.source);
    const axe = (window as unknown as { axe: typeof axeCore }).axe;

    const disabledRules = new Set([...STATIC_DISABLED_RULES, ...(opts.excludeRules ?? [])]);
    const rulesConfig = Object.fromEntries([...disabledRules].map((id) => [id, { enabled: false }]));

    // resultTypes에 "passes"를 넣으면 axe-core가 모든 통과 사례까지 리포트하느라 대규모 문서에서
    // 수십 배 느려진다(500행 표 기준 <1초 → 50초+ 실측). checkpoint 상태 계산은 단일 소스의
    // axeRules 목록으로 "실행 가능 여부"를 판단하므로(normalize/checkpoints.ts) axe의 실제
    // passes 결과가 필요 없다 — violations·incomplete만 요청한다.
    const axeResults = await axe.run(window.document, {
      runOnly: { type: "tag", values: TAGS[ruleset] },
      rules: rulesConfig,
      resultTypes: ["violations", "incomplete"],
    });

    // axe-core의 실제 결과 타입(AxeResults)은 target을 크로스트리·섀도우 DOM까지 포괄하는
    // 복잡한 유니언으로 선언한다. 이 프로젝트는 일반적인 문자열 선택자 배열만 다루므로 우리
    // 쪽 좁은 타입(AxeRunResults)으로 단언한다.
    const axeFindings = normalizeAxeResults(
      axeResults as unknown as Parameters<typeof normalizeAxeResults>[0],
      opts.data.axeRuleMap,
      opts.data.wcag22,
    );

    const kFindings: Finding[] = [];
    if (ruleset === "kwcag22") {
      const ctx: StaticContext = {
        document: window.document,
        window,
        html: opts.html,
        baseUrl: opts.baseUrl,
        data: opts.data,
      };
      for (const rule of KRULES) {
        if (opts.excludeRules?.includes(rule.id)) continue;
        try {
          kFindings.push(...rule.run(ctx));
        } catch (err) {
          notices.push(
            `규칙 ${rule.id} 실행 중 오류가 발생해 건너뜁니다: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }

    const title = window.document.title || undefined;
    return { findings: [...axeFindings, ...kFindings], title, notices };
  } finally {
    window.close();
  }
}

function runStaticInWorker(
  workerPath: string,
  input: StaticWorkerInput,
  timeoutMs: number,
): Promise<RunStaticResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, { workerData: input });
    let settled = false;
    const finish = (fn: () => void): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      fn();
    };
    const timer = setTimeout(() => {
      finish(() => reject(new EngineTimeoutError("정적 검사 시간이 초과되었습니다.")));
    }, timeoutMs);
    worker.once("message", (msg: { ok: true; result: RunStaticResult } | { ok: false; error: string }) => {
      finish(() => (msg.ok ? resolve(msg.result) : reject(new Error(msg.error))));
    });
    worker.once("error", (err) => finish(() => reject(err)));
  });
}

/**
 * 정적 검사를 실행한다. 컴파일된 워커(dist/engine/static-worker.js)가 있으면 워커에서 실행하고
 * 하드 타임아웃 초과 시 worker.terminate()로 강제 종료한다(동기 점유도 확실히 중단). 워커가 없는
 * 개발(tsx)·테스트(vitest src 실행) 환경에서는 인라인으로 실행하되 best-effort 소프트 타임아웃만
 * 적용한다(03 §5.1). 어느 경로든 초과 시 EngineTimeoutError를 던진다.
 */
export async function runStatic(opts: RunStaticOptions): Promise<RunStaticResult> {
  const timeoutMs = opts.timeoutMs ?? ENGINE_TIMEOUT_MS;
  const workerPath = fileURLToPath(new URL("./static-worker.js", import.meta.url));
  if (existsSync(workerPath)) {
    return runStaticInWorker(
      workerPath,
      { html: opts.html, baseUrl: opts.baseUrl, ruleset: opts.ruleset, excludeRules: opts.excludeRules },
      timeoutMs,
    );
  }
  return withTimeout(runStaticCore(opts), timeoutMs);
}

/** 워커 엔트리(static-worker.ts)가 호출한다. 자체적으로 DataBundle을 로드해 클론 불가 문제를 피한다. */
export async function runStaticFromWorkerInput(input: StaticWorkerInput): Promise<RunStaticResult> {
  const data = loadDataBundle();
  return runStaticCore({ ...input, data });
}
