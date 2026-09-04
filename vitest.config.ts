import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 규칙 골든 테스트는 bare describe/it/expect 사용 (03 §7 컨벤션).
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // T-02 시점에는 tests/(W 레인)가 아직 비어 있다 — 0건이어도 게이트가 막히지 않게 한다.
    passWithNoTests: true,
  },
});
