// registry.ts가 규칙 목록·검사항목 귀속을 단일 소스 데이터와 대조하는지 검증한다(ADR-04).
import { KRULES, validateRegistry } from "../../src/rules/registry.js";
import { loadDataBundle } from "../../src/data/loader.js";
import { parseRuleCatalog } from "../data/checklist-source.js";

const data = loadDataBundle();

describe("규칙 레지스트리 ↔ 단일 소스 정합성", () => {
  it("TC-REGISTRY-01: T1 k-규칙이 정확히 18개이고 §5 목록과 ID 집합이 같다", () => {
    const catalog = parseRuleCatalog();
    expect(KRULES.length).toBe(18);
    expect(KRULES.map((r) => r.id).sort()).toEqual([...catalog.t1].sort());
  });

  it("TC-REGISTRY-02: 모든 규칙이 tier T1이고 kwcag22.json에 실재하는 검사항목에 귀속된다", () => {
    for (const rule of KRULES) {
      expect(rule.tier).toBe("T1");
      expect(rule.engine).toBe("k");
      expect(data.kwcag22.findById(rule.kwcag)).toBeDefined();
    }
  });

  it("TC-REGISTRY-03: validateRegistry는 정상 데이터에서 예외를 던지지 않는다", () => {
    expect(() => validateRegistry(KRULES, data)).not.toThrow();
  });

  it("TC-REGISTRY-04: 존재하지 않는 검사항목에 귀속된 규칙은 기동을 중단시킨다", () => {
    const bogus = [{ ...KRULES[0]!, kwcag: "9.9.9" }];
    expect(() => validateRegistry(bogus, data)).toThrow();
  });
});
