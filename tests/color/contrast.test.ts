import { parseColor, relativeLuminance, contrastRatio, evaluateContrast } from "../../src/color/contrast.js";

describe("색상 파싱·명도 대비 계산 (5.4.3)", () => {
  it("TC-COLOR-CONTRAST-01: 검정/흰색 대비는 21:1에 가깝다", () => {
    const result = evaluateContrast("#000000", "#ffffff");
    expect(result.ratio).toBeCloseTo(21, 0);
    expect(result.aa).toBe("pass");
    expect(result.aaa).toBe("pass");
    expect(result.threshold).toBe(4.5);
    expect(result.largeText).toBe(false);
  });

  it("TC-COLOR-CONTRAST-02: 연한 회색/흰색은 AA 기준(4.5:1)을 통과하지 못한다", () => {
    const result = evaluateContrast("#cccccc", "#ffffff");
    expect(result.aa).toBe("fail");
  });

  it("TC-COLOR-CONTRAST-03: 24px 이상은 큰 글자로 취급해 임계값이 3:1이다", () => {
    const result = evaluateContrast("#767676", "#ffffff", 24);
    expect(result.largeText).toBe(true);
    expect(result.threshold).toBe(3.0);
  });

  it("TC-COLOR-CONTRAST-04: 18.66px 이상 굵게는 큰 글자로 취급한다", () => {
    const result = evaluateContrast("#767676", "#ffffff", 18.66, true);
    expect(result.largeText).toBe(true);
  });

  it("TC-COLOR-CONTRAST-05: 알파가 있는 전경색은 배경에 합성한 뒤 계산한다", () => {
    const opaque = evaluateContrast("#808080", "#ffffff");
    const composited = evaluateContrast("rgba(128,128,128,1)", "#ffffff");
    expect(composited.ratio).toBeCloseTo(opaque.ratio, 5);
  });

  it("TC-COLOR-CONTRAST-06: rgb()·hsl()·색 이름을 파싱한다", () => {
    expect(parseColor("rgb(0, 0, 0)")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(parseColor("black")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(parseColor("hsl(0, 0%, 100%)")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });

  it("TC-COLOR-CONTRAST-07: 파싱 실패는 null을 반환한다", () => {
    expect(parseColor("not-a-color")).toBeNull();
  });

  it("TC-COLOR-CONTRAST-08: relativeLuminance·contrastRatio 단독 호출도 동작한다", () => {
    const white = relativeLuminance({ r: 255, g: 255, b: 255 });
    const black = relativeLuminance({ r: 0, g: 0, b: 0 });
    expect(contrastRatio(white, black)).toBeCloseTo(21, 0);
  });
});
