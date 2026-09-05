import { rule } from "../../src/rules/b/b-target-size-6mm.js";
import { openFixturePage, describeBrowser } from "./browser-harness.js";

await describeBrowser("b-target-size-6mm (6.1.3)", () => {
  it("TC-B-TARGET-SIZE-6MM-01: 6mm(22.7px) 미만 타깃을 검출한다", async () => {
    const session = await openFixturePage("b-target-size-6mm-fail.html");
    try {
      const findings = await rule.run(session.ctx);
      expect(findings.map((f) => f.selector)).toEqual(["#tiny"]);
    } finally {
      await session.close();
    }
  });

  it("TC-B-TARGET-SIZE-6MM-02: 24px 이상이면 오탐 0건이다", async () => {
    const session = await openFixturePage("b-target-size-6mm-pass.html");
    try {
      const findings = await rule.run(session.ctx);
      expect(findings).toEqual([]);
    } finally {
      await session.close();
    }
  });
});
