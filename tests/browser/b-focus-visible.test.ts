import { rule } from "../../src/rules/b/b-focus-visible.js";
import { openFixturePage, describeBrowser } from "./browser-harness.js";

await describeBrowser("b-focus-visible (6.1.2)", () => {
  it("TC-B-FOCUS-VISIBLE-01: outline:none만 있고 대안이 없으면 검출한다", async () => {
    const session = await openFixturePage("b-focus-visible-fail.html");
    try {
      const findings = await rule.run(session.ctx);
      expect(findings.map((f) => f.selector)).toEqual(["#bad-focus-1"]);
    } finally {
      await session.close();
    }
  });

  it("TC-B-FOCUS-VISIBLE-02: 대안 스타일이 있으면 오탐 0건이다", async () => {
    const session = await openFixturePage("b-focus-visible-pass.html");
    try {
      const findings = await rule.run(session.ctx);
      expect(findings).toEqual([]);
    } finally {
      await session.close();
    }
  });
});
