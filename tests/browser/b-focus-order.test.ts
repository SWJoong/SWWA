import { rule } from "../../src/rules/b/b-focus-order.js";
import { openFixturePage, describeBrowser } from "./browser-harness.js";

await describeBrowser("b-focus-order (6.1.2)", () => {
  it("TC-B-FOCUS-ORDER-01: tabindex로 역행하는 초점 순서를 검출한다", async () => {
    const session = await openFixturePage("b-focus-order-fail.html");
    try {
      const findings = await rule.run(session.ctx);
      expect(findings.length).toBeGreaterThan(0);
    } finally {
      await session.close();
    }
  });

  it("TC-B-FOCUS-ORDER-02: DOM 순서와 일치하면 오탐 0건이다", async () => {
    const session = await openFixturePage("b-focus-order-pass.html");
    try {
      const findings = await rule.run(session.ctx);
      expect(findings).toEqual([]);
    } finally {
      await session.close();
    }
  });
});
