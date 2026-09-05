import { rule } from "../../src/rules/b/b-skip-link-works.js";
import { openFixturePage, describeBrowser } from "./browser-harness.js";

await describeBrowser("b-skip-link-works (6.4.1)", () => {
  it("TC-B-SKIP-LINK-WORKS-01: 대상에 초점이 이동하지 않으면 검출한다", async () => {
    const session = await openFixturePage("b-skip-link-works-fail.html");
    try {
      const findings = await rule.run(session.ctx);
      expect(findings.map((f) => f.selector)).toEqual(["#skip"]);
    } finally {
      await session.close();
    }
  });

  it("TC-B-SKIP-LINK-WORKS-02: tabindex=-1로 초점이 이동하면 오탐 0건이다", async () => {
    const session = await openFixturePage("b-skip-link-works-pass.html");
    try {
      const findings = await rule.run(session.ctx);
      expect(findings).toEqual([]);
    } finally {
      await session.close();
    }
  });
});
