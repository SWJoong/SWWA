import { rule } from "../../src/rules/b/b-keyboard-reachable.js";
import { openFixturePage, describeBrowser } from "./browser-harness.js";

await describeBrowser("b-keyboard-reachable (6.1.1)", () => {
  it("TC-B-KEYBOARD-REACHABLE-01: 숨겨져 Tab으로 도달하지 못하는 상호작용 요소를 검출한다", async () => {
    const session = await openFixturePage("b-keyboard-reachable-fail.html");
    try {
      const findings = await rule.run(session.ctx);
      expect(findings.map((f) => f.selector)).toEqual(["#hidden-click"]);
    } finally {
      await session.close();
    }
  });

  it("TC-B-KEYBOARD-REACHABLE-02: 보이고 Tab으로 도달하면 오탐 0건이다", async () => {
    const session = await openFixturePage("b-keyboard-reachable-pass.html");
    try {
      const findings = await rule.run(session.ctx);
      expect(findings).toEqual([]);
    } finally {
      await session.close();
    }
  });
});
