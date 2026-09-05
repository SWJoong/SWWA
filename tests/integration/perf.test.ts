import { performance } from "node:perf_hooks";
import { runStaticCore } from "../../src/engine/static.js";
import { loadDataBundle } from "../../src/data/loader.js";

/**
 * T-11 · 성능. "500KB ≤ 2초"는 하드 타임아웃 도입으로 "대용량도 타임아웃 내 안전 실패"로 재정의됨
 * (03 §5.1). 여기서는 실질 계약을 고정한다: (1) 데이터 로드 기동 예산, (2) 일반 컴포넌트/페이지
 * 정적 검사가 충분히 빠름. 대용량 하드 타임아웃 자체는 tests/engine/static-worker.test.ts가 담당.
 */
const data = loadDataBundle();

function typicalPage(): string {
  const items = Array.from(
    { length: 30 },
    (_, i) => `<li><a href="/d/${i}">2026년 예산 항목 ${i} 자세히 보기</a></li>`,
  ).join("");
  return `<!doctype html><html lang="ko"><head><title>예산 목록 - 예산제</title></head><body><a href="#main">본문 바로가기</a><nav><ul>${items}</ul></nav><main id="main"><h1>목록</h1><form><label for="q">검색</label><input id="q"></form></main></body></html>`;
}

describe("성능 (T-11, NFR-02)", () => {
  it("TC-PERF-01: 데이터 번들 로드가 1.5초 이내(기동 예산)", () => {
    const start = performance.now();
    const bundle = loadDataBundle();
    const elapsed = performance.now() - start;
    expect(bundle.kwcag22.checkpoints.length).toBe(33);
    expect(elapsed).toBeLessThan(1500);
  });

  it("TC-PERF-02: 일반 페이지 정적 검사가 2초 이내(인라인 경로)", async () => {
    const html = typicalPage();
    const start = performance.now();
    const result = await runStaticCore({ html, data });
    const elapsed = performance.now() - start;
    expect(result.findings).toBeInstanceOf(Array);
    expect(elapsed).toBeLessThan(2000);
  }, 15_000);
});
