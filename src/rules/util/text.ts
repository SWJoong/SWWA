/** 공백을 정규화한다(연속 공백·줄바꿈 → 단일 스페이스, 양끝 trim). */
export function normText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** 한글(가-힣) 문자 비율을 계산한다(공백·구두점 제외 문자 기준). */
export function hangulRatio(text: string): number {
  const chars = text.replace(/\s/g, "");
  if (chars.length === 0) return 0;
  const hangul = chars.match(/[가-힣]/g)?.length ?? 0;
  return hangul / chars.length;
}
