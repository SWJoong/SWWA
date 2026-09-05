import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 규칙 골든 테스트는 bare describe/it/expect 사용 (03 §7 컨벤션).
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // T-02 시점에는 tests/(W 레인)가 아직 비어 있다 — 0건이어도 게이트가 막히지 않게 한다.
    passWithNoTests: true,
    // 브라우저 테스트(실제 Chrome launch + Tab 순회)·워커 테스트는 느린 CI 러너에서 기본 5초를
    // 넘긴다. 정적 테스트는 ms 단위라 이 상한에 영향받지 않는다(최댓값일 뿐 지연이 아님).
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
