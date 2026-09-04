// CSS 색 파싱·상대 휘도·명도 대비 계산(03 §1 color/contrast.ts, check_contrast 도구가 사용).
// 표준 CSS 색 이름(CSS Color Module Level 3/4) 테이블 — 흔히 쓰이는 이름 위주.
const NAMED_COLORS: Record<string, [number, number, number]> = {
  aliceblue: [240, 248, 255], antiquewhite: [250, 235, 215], aqua: [0, 255, 255],
  aquamarine: [127, 255, 212], azure: [240, 255, 255], beige: [245, 245, 220],
  bisque: [255, 228, 196], black: [0, 0, 0], blanchedalmond: [255, 235, 205],
  blue: [0, 0, 255], blueviolet: [138, 43, 226], brown: [165, 42, 42],
  burlywood: [222, 184, 135], cadetblue: [95, 158, 160], chartreuse: [127, 255, 0],
  chocolate: [210, 105, 30], coral: [255, 127, 80], cornflowerblue: [100, 149, 237],
  cornsilk: [255, 248, 220], crimson: [220, 20, 60], cyan: [0, 255, 255],
  darkblue: [0, 0, 139], darkcyan: [0, 139, 139], darkgoldenrod: [184, 134, 11],
  darkgray: [169, 169, 169], darkgreen: [0, 100, 0], darkgrey: [169, 169, 169],
  darkkhaki: [189, 183, 107], darkmagenta: [139, 0, 139], darkolivegreen: [85, 107, 47],
  darkorange: [255, 140, 0], darkorchid: [153, 50, 204], darkred: [139, 0, 0],
  darksalmon: [233, 150, 122], darkseagreen: [143, 188, 143], darkslateblue: [72, 61, 139],
  darkslategray: [47, 79, 79], darkslategrey: [47, 79, 79], darkturquoise: [0, 206, 209],
  darkviolet: [148, 0, 211], deeppink: [255, 20, 147], deepskyblue: [0, 191, 255],
  dimgray: [105, 105, 105], dimgrey: [105, 105, 105], dodgerblue: [30, 144, 255],
  firebrick: [178, 34, 34], floralwhite: [255, 250, 240], forestgreen: [34, 139, 34],
  fuchsia: [255, 0, 255], gainsboro: [220, 220, 220], ghostwhite: [248, 248, 255],
  gold: [255, 215, 0], goldenrod: [218, 165, 32], gray: [128, 128, 128],
  grey: [128, 128, 128], green: [0, 128, 0], greenyellow: [173, 255, 47],
  honeydew: [240, 255, 240], hotpink: [255, 105, 180], indianred: [205, 92, 92],
  indigo: [75, 0, 130], ivory: [255, 255, 240], khaki: [240, 230, 140],
  lavender: [230, 230, 250], lavenderblush: [255, 240, 245], lawngreen: [124, 252, 0],
  lemonchiffon: [255, 250, 205], lightblue: [173, 216, 230], lightcoral: [240, 128, 128],
  lightcyan: [224, 255, 255], lightgoldenrodyellow: [250, 250, 210], lightgray: [211, 211, 211],
  lightgreen: [144, 238, 144], lightgrey: [211, 211, 211], lightpink: [255, 182, 193],
  lightsalmon: [255, 160, 122], lightseagreen: [32, 178, 170], lightskyblue: [135, 206, 250],
  lightslategray: [119, 136, 153], lightslategrey: [119, 136, 153], lightsteelblue: [176, 196, 222],
  lightyellow: [255, 255, 224], lime: [0, 255, 0], limegreen: [50, 205, 50],
  linen: [250, 240, 230], magenta: [255, 0, 255], maroon: [128, 0, 0],
  mediumaquamarine: [102, 205, 170], mediumblue: [0, 0, 205], mediumorchid: [186, 85, 211],
  mediumpurple: [147, 112, 219], mediumseagreen: [60, 179, 113], mediumslateblue: [123, 104, 238],
  mediumspringgreen: [0, 250, 154], mediumturquoise: [72, 209, 204], mediumvioletred: [199, 21, 133],
  midnightblue: [25, 25, 112], mintcream: [245, 255, 250], mistyrose: [255, 228, 225],
  moccasin: [255, 228, 181], navajowhite: [255, 222, 173], navy: [0, 0, 128],
  oldlace: [253, 245, 230], olive: [128, 128, 0], olivedrab: [107, 142, 35],
  orange: [255, 165, 0], orangered: [255, 69, 0], orchid: [218, 112, 214],
  palegoldenrod: [238, 232, 170], palegreen: [152, 251, 152], paleturquoise: [175, 238, 238],
  palevioletred: [219, 112, 147], papayawhip: [255, 239, 213], peachpuff: [255, 218, 185],
  peru: [205, 133, 63], pink: [255, 192, 203], plum: [221, 160, 221],
  powderblue: [176, 224, 230], purple: [128, 0, 128], rebeccapurple: [102, 51, 153],
  red: [255, 0, 0], rosybrown: [188, 143, 143], royalblue: [65, 105, 225],
  saddlebrown: [139, 69, 19], salmon: [250, 128, 114], sandybrown: [244, 164, 96],
  seagreen: [46, 139, 87], seashell: [255, 245, 238], sienna: [160, 82, 45],
  silver: [192, 192, 192], skyblue: [135, 206, 235], slateblue: [106, 90, 205],
  slategray: [112, 128, 144], slategrey: [112, 128, 144], snow: [255, 250, 250],
  springgreen: [0, 255, 127], steelblue: [70, 130, 180], tan: [210, 180, 140],
  teal: [0, 128, 128], thistle: [216, 191, 216], tomato: [255, 99, 71],
  turquoise: [64, 224, 208], violet: [238, 130, 238], wheat: [245, 222, 179],
  white: [255, 255, 255], whitesmoke: [245, 245, 245], yellow: [255, 255, 0],
  yellowgreen: [154, 205, 50],
};

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

function clamp255(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)));
}

function parsePercentOrNumber(raw: string, max = 255): number {
  const trimmed = raw.trim();
  if (trimmed.endsWith("%")) return (parseFloat(trimmed) / 100) * max;
  return parseFloat(trimmed);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.min(1, Math.max(0, s));
  const light = Math.min(1, Math.max(0, l));
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  let r1: number, g1: number, b1: number;
  if (hue < 60) [r1, g1, b1] = [c, x, 0];
  else if (hue < 120) [r1, g1, b1] = [x, c, 0];
  else if (hue < 180) [r1, g1, b1] = [0, c, x];
  else if (hue < 240) [r1, g1, b1] = [0, x, c];
  else if (hue < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  return [clamp255((r1 + m) * 255), clamp255((g1 + m) * 255), clamp255((b1 + m) * 255)];
}

/** hex/rgb()/rgba()/hsl()/hsla()/CSS 색 이름을 파싱한다. 실패 시 null. */
export function parseColor(input: string): RGBA | null {
  const s = input.trim().toLowerCase();

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
  if (hex) {
    const v = hex[1] as string;
    if (v.length === 3 || v.length === 4) {
      const r = parseInt((v[0] as string) + v[0], 16);
      const g = parseInt((v[1] as string) + v[1], 16);
      const b = parseInt((v[2] as string) + v[2], 16);
      const a = v.length === 4 ? parseInt((v[3] as string) + v[3], 16) / 255 : 1;
      return { r, g, b, a };
    }
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    const a = v.length === 8 ? parseInt(v.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  const rgb = /^rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*(?:,\s*([\d.]+%?)\s*)?\)$/.exec(s);
  if (rgb) {
    const [, rRaw, gRaw, bRaw, aRaw] = rgb as unknown as [string, string, string, string, string?];
    return {
      r: clamp255(parsePercentOrNumber(rRaw)),
      g: clamp255(parsePercentOrNumber(gRaw)),
      b: clamp255(parsePercentOrNumber(bRaw)),
      a: aRaw !== undefined ? parsePercentOrNumber(aRaw, 1) : 1,
    };
  }

  const hsl = /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+%?)\s*)?\)$/.exec(s);
  if (hsl) {
    const [, hRaw, sRaw, lRaw, aRaw] = hsl as unknown as [string, string, string, string, string?];
    const [r, g, b] = hslToRgb(parseFloat(hRaw), parseFloat(sRaw) / 100, parseFloat(lRaw) / 100);
    return { r, g, b, a: aRaw !== undefined ? parsePercentOrNumber(aRaw, 1) : 1 };
  }

  const named = NAMED_COLORS[s];
  if (named) return { r: named[0], g: named[1], b: named[2], a: 1 };
  if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };

  return null;
}

/** 알파가 있는 전경색을 배경 위에 합성한다(불투명 배경 가정). */
export function compositeOver(fg: RGBA, bg: RGB): RGB {
  if (fg.a >= 1) return { r: fg.r, g: fg.g, b: fg.b };
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
  };
}

function srgbChannel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** WCAG 상대 휘도(0~1). */
export function relativeLuminance(rgb: RGB): number {
  return 0.2126 * srgbChannel(rgb.r) + 0.7152 * srgbChannel(rgb.g) + 0.0722 * srgbChannel(rgb.b);
}

/** 두 상대 휘도의 명도 대비율(1~21). */
export function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastEvaluation {
  ratio: number;
  largeText: boolean;
  aa: "pass" | "fail";
  aaa: "pass" | "fail";
  threshold: number;
}

/**
 * 전경·배경 문자열로 명도 대비를 계산한다(5.4.3/1.4.3). 큰 글자 = 24px 이상 또는
 * 18.66px 이상 굵게(WCAG 18pt/14pt bold를 96dpi 기준 px로 환산).
 */
export function evaluateContrast(
  foreground: string,
  background: string,
  fontSizePx = 16,
  bold = false,
): ContrastEvaluation {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) {
    throw new Error(`색상 값을 해석할 수 없습니다: ${!fg ? foreground : background}`);
  }
  const composited = compositeOver(fg, { r: bg.r, g: bg.g, b: bg.b });
  const ratio = contrastRatio(relativeLuminance(composited), relativeLuminance(bg));
  const largeText = fontSizePx >= 24 || (bold && fontSizePx >= 18.66);
  const threshold = largeText ? 3.0 : 4.5;
  const aaaThreshold = largeText ? 4.5 : 7.0;
  return {
    ratio,
    largeText,
    aa: ratio >= threshold ? "pass" : "fail",
    aaa: ratio >= aaaThreshold ? "pass" : "fail",
    threshold,
  };
}
