// 하드 타임아웃(worker.terminate) 회귀 테스트. runStatic은 src 실행(vitest) 시 워커 .js가 없어
// 인라인으로 동작하므로, 이 테스트는 **빌드된 dist 워커**를 직접 겨냥한다. dist가 없으면(빌드 전
// bare `npm test`) 스킵한다. `npm run check`는 test 전에 build하므로 CI에서는 항상 실행된다.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadDataBundle } from "../../src/data/loader.js";

const distStatic = fileURLToPath(new URL("../../dist/engine/static.js", import.meta.url));
const distWorker = fileURLToPath(new URL("../../dist/engine/static-worker.js", import.meta.url));
const distReady = existsSync(distStatic) && existsSync(distWorker);

function pathologicalHtml(): string {
  const rows = Array.from({ length: 4000 }, (_, i) => `<tr><td>항목 ${i}</td><td>내용 ${i}</td></tr>`).join("");
  return `<!doctype html><html lang="ko"><head><title>대량 - 예산제</title></head><body><a href="#m">본문 바로가기</a><main id="m"><table><caption>목록</caption><tr><th>a</th><th>b</th></tr>${rows}</table></main></body></html>`;
}

describe.skipIf(!distReady)("정적 엔진 하드 타임아웃 (dist 워커)", () => {
  it("TC-STATIC-WORKER-01: 병리적 대용량 입력을 하드 타임아웃으로 강제 종료한다", async () => {
    const { runStatic, EngineTimeoutError } = await import(distStatic);
    const data = loadDataBundle();
    const start = Date.now();
    await expect(runStatic({ html: pathologicalHtml(), data, timeoutMs: 500 })).rejects.toBeInstanceOf(
      EngineTimeoutError,
    );
    // terminate가 동기 점유를 실제로 중단했는지: 타임아웃(500ms) 직후 수 초 내에 거부되어야 한다.
    expect(Date.now() - start).toBeLessThan(4000);
  }, 15_000);

  it("TC-STATIC-WORKER-02: 정상 페이지는 워커 경로에서 결과를 반환한다", async () => {
    const { runStatic } = await import(distStatic);
    const data = loadDataBundle();
    const html =
      '<!doctype html><html lang="ko"><head><title>정상 - 예산제</title></head><body><a href="#m">본문 바로가기</a><main id="m">내용</main></body></html>';
    const result = await runStatic({ html, data });
    expect(result.findings).toBeInstanceOf(Array);
    expect(result.title).toContain("정상");
  }, 15_000);
});
