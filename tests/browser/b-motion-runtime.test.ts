import { rule } from "../../src/rules/b/b-motion-runtime.js";
import { openFixturePage, describeBrowser } from "./browser-harness.js";

const OBSERVE_MS = 800; // 실제 규칙 기본값(5000ms)보다 짧게 관찰해 테스트 속도를 높인다.

await describeBrowser("b-motion-runtime (6.2.2)", () => {
  it("TC-B-MOTION-RUNTIME-01: 정지 컨트롤 없는 자동 변경 콘텐츠를 검출한다", async () => {
    const session = await openFixturePage("b-motion-runtime-fail.html");
    try {
      const findings = await rule.run({ ...session.ctx, motionObserveMs: OBSERVE_MS });
      expect(findings.length).toBe(1);
    } finally {
      await session.close();
    }
  });

  it("TC-B-MOTION-RUNTIME-02: '일시정지' 컨트롤이 있으면 오탐 0건이다", async () => {
    const session = await openFixturePage("b-motion-runtime-pass.html");
    try {
      const findings = await rule.run({ ...session.ctx, motionObserveMs: OBSERVE_MS });
      expect(findings).toEqual([]);
    } finally {
      await session.close();
    }
  });
});
