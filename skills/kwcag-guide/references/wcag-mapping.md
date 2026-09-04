# WCAG 2.2 ↔ KWCAG 2.2 대조표

> 단일 소스는 [kwcag22-checklist.md](kwcag22-checklist.md)(ADR-04). 이 문서는 그 §4의 WCAG 번호를
> **WCAG 2.2 확정본(W3C Recommendation, 2023-10-05) 기준 전체 A·AA 목록**에 역으로 대응시켜
> `assets/wcag22.json`(§5 데이터 모델의 `criteria[].kwcagIds`)을 만드는 근거로 삼는다.
> KWCAG 33개 검사항목은 WCAG A·AA 전체(약 50개)보다 적으므로, 대응되는 KWCAG가 없는 SC는
> `kwcagIds: []`로 둔다(누락이 아니라 KWCAG가 더 상위 수준으로 묶었거나 국내 지침에서 별도로
> 다루지 않는 경우다).

## 1. WCAG 2.2 A·AA 전체 목록 → KWCAG 대응

| WCAG SC | 이름(영문) | 레벨 | 대응 KWCAG ID(별칭) |
|---|---|---|---|
| 1.1.1 | Non-text Content | A | 5.1.1 (1.1.1) |
| 1.2.1 | Audio-only and Video-only (Prerecorded) | A | 5.2.1 (1.2.1) |
| 1.2.2 | Captions (Prerecorded) | A | 5.2.1 (1.2.1) |
| 1.2.3 | Audio Description or Media Alternative (Prerecorded) | A | 5.2.1 (1.2.1) |
| 1.2.4 | Captions (Live) | AA | — |
| 1.2.5 | Audio Description (Prerecorded) | AA | — |
| 1.3.1 | Info and Relationships | A | 5.3.1 (1.3.1) |
| 1.3.2 | Meaningful Sequence | A | 5.3.2 (1.3.2) |
| 1.3.3 | Sensory Characteristics | A | 5.3.3 (1.3.3) |
| 1.3.4 | Orientation | AA | — |
| 1.3.5 | Identify Input Purpose | AA | — |
| 1.4.1 | Use of Color | A | 5.4.1 (1.4.1) |
| 1.4.2 | Audio Control | A | 5.4.2 (1.4.2) |
| 1.4.3 | Contrast (Minimum) | AA | 5.4.3 (1.4.3) |
| 1.4.4 | Resize Text | AA | — |
| 1.4.5 | Images of Text | AA | — |
| 1.4.10 | Reflow | AA | — |
| 1.4.11 | Non-text Contrast | AA | 5.4.4 (1.4.4) *(참고 대응 — KWCAG 원문은 "콘텐츠 간의 구분"으로 더 넓게 서술)* |
| 1.4.12 | Text Spacing | AA | — |
| 1.4.13 | Content on Hover or Focus | AA | — |
| 2.1.1 | Keyboard | A | 6.1.1 (2.1.1) |
| 2.1.2 | No Keyboard Trap | A | 6.1.1 (2.1.1) *(KWCAG는 "키보드 사용 보장"에 트랩 방지를 포함해 서술)* |
| 2.1.4 | Character Key Shortcuts | A | 6.1.4 (2.1.4) |
| 2.2.1 | Timing Adjustable | A | 6.2.1 (2.2.1) |
| 2.2.2 | Pause, Stop, Hide | A | 6.2.2 (2.2.2) |
| 2.3.1 | Three Flashes or Below Threshold | A | 6.3.1 (2.3.1) |
| 2.4.1 | Bypass Blocks | A | 6.4.1 (2.4.1) |
| 2.4.2 | Page Titled | A | 6.4.2 (2.4.2) |
| 2.4.3 | Focus Order | A | 6.1.2 (2.1.2) |
| 2.4.4 | Link Purpose (In Context) | A | 6.4.3 (2.4.3) |
| 2.4.5 | Multiple Ways | AA | — |
| 2.4.6 | Headings and Labels | AA | 6.4.2 (2.4.2) *(참고 대응)* |
| 2.4.7 | Focus Visible | AA | 6.1.2 (2.1.2) |
| 2.4.11 | Focus Not Obscured (Minimum) *(2.2 신규)* | AA | — |
| 2.5.1 | Pointer Gestures | A | 6.5.1 (2.5.1) |
| 2.5.2 | Pointer Cancellation | A | 6.5.2 (2.5.2) |
| 2.5.3 | Label in Name | A | 6.5.3 (2.5.3) |
| 2.5.4 | Motion Actuation | A | 6.5.4 (2.5.4) |
| 2.5.7 | Dragging Movements *(2.2 신규)* | AA | — |
| 2.5.8 | Target Size (Minimum) *(2.2 신규)* | AA | 6.1.3 (2.1.3) *(참고 대응 — b-target-size-6mm는 22.7px@96dpi 기준, WCAG 24×24px 기준과 임계값 상이. 08-plan 확정 시 재검토)* |
| 3.1.1 | Language of Page | A | 7.1.1 (3.1.1) |
| 3.1.2 | Language of Parts | AA | — |
| 3.2.1 | On Focus | A | 7.2.1 (3.2.1) |
| 3.2.2 | On Input | A | 7.2.1 (3.2.1) |
| 3.2.3 | Consistent Navigation | AA | — |
| 3.2.4 | Consistent Identification | AA | — |
| 3.2.6 | Consistent Help *(2.2 신규)* | A | 7.2.2 (3.2.2) |
| 3.3.1 | Error Identification | A | 7.3.1 (3.3.1) |
| 3.3.2 | Labels or Instructions | A | 7.3.2 (3.3.2) |
| 3.3.3 | Error Suggestion | AA | 7.3.1 (3.3.1) *(참고 대응)* |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | — |
| 3.3.7 | Redundant Entry *(2.2 신규)* | A | 7.3.4 (3.3.4) |
| 3.3.8 | Accessible Authentication (Minimum) *(2.2 신규)* | AA | 7.3.3 (3.3.3) |
| 4.1.2 | Name, Role, Value | A | 8.2.1 (4.2.1) |
| 4.1.3 | Status Messages | AA | — |

**주의 — 4.1.1 Parsing**: WCAG 2.2 확정본(2023-10-05)에서 **폐지(obsolete/removed)** 되었다(HTML5
파서·보조기술 개선으로 더 이상 별도 기준으로 두지 않음). KWCAG 2.2 원문은 8.1.1(4.1.1) "마크업
오류 방지"를 여전히 WCAG 4.1.1로 참조하고 있어 — 원문이 WCAG 2.2 **초안**(4.1.1이 살아있던 시점)
번호를 그대로 가져왔거나, 국내 지침 특성상 국제 표준 폐지와 무관하게 유지한 것으로 보인다.
**검증 필요**: KWCAG 2.2 확정 공고문·해설서에서 8.1.1의 근거 조항을 재확인해야 한다
(`assets/kwcag22.json`에 `needsVerification: true`로 표기).

## 2. KWCAG 2.2 신규 9항목(2.1→2.2)의 WCAG 대응 재확인

`kwcag22-checklist.md` §3 각주의 9항목은 WCAG 기준으로 보면 성격이 둘로 나뉜다.

| KWCAG ID | WCAG 대응 | WCAG 기준 도입 시점 | 비고 |
|---|---|---|---|
| 6.1.4 (2.1.4) | 2.1.4 | WCAG 2.1(2018) | KWCAG는 2.1 개정에서 누락, 2.2에서 뒤늦게 반영 |
| 6.5.1~6.5.4 (2.5.1~2.5.4) | 2.5.1~2.5.4 | WCAG 2.1(2018) | 위와 동일(포인터 입력 4종) |
| 6.4.4 (2.4.4) | 없음(전자출판 고유) | — | WCAG에 대응 SC 없음. 국내 전자출판(EPUB) 접근성 요구 반영 |
| 7.2.2 (3.2.2) | 3.2.6 | WCAG 2.2(2023) | 진짜 WCAG 2.2 신규 |
| 7.3.3 (3.3.3) | 3.3.8 | WCAG 2.2(2023) | 진짜 WCAG 2.2 신규 |
| 7.3.4 (3.3.4) | 3.3.7 | WCAG 2.2(2023) | 진짜 WCAG 2.2 신규 |

즉 9항목 중 5개(6.1.4·6.5.1~6.5.4)는 **WCAG 2.1을 뒤늦게 따라잡은 것**이고, 1개(6.4.4)는 **WCAG에
대응이 없는 국내 고유 항목**이며, 3개(7.2.2·7.3.3·7.3.4)만 **실제 WCAG 2.2 신규**다.

## 3. AAA (참고용, 요약)

인증 기준에는 사용하지 않으나 `assets/wcag22.json`에 참고로 포함한다(00-overview.md 확정 결정).

1.2.6 Sign Language · 1.2.7 Extended Audio Description · 1.2.8 Media Alternative · 1.2.9 Audio-only (Live) ·
1.3.6 Identify Purpose · 1.4.6 Contrast (Enhanced) · 1.4.7 Low or No Background Audio · 1.4.8 Visual
Presentation · 1.4.9 Images of Text (No Exception) · 2.1.3 Keyboard (No Exception) · 2.2.3 No Timing ·
2.2.4 Interruptions · 2.2.5 Re-authenticating · 2.2.6 Timeouts · 2.3.2 Three Flashes · 2.3.3 Animation from
Interactions · 2.4.8 Location · 2.4.9 Link Purpose (Link Only) · 2.4.10 Section Headings · 2.4.12 Focus Not
Obscured (Enhanced)*(2.2 신규)* · 2.4.13 Focus Appearance*(2.2 신규)* · 2.5.5 Target Size (Enhanced) ·
2.5.6 Concurrent Input Mechanisms · 3.1.3 Unusual Words · 3.1.4 Abbreviations · 3.1.5 Reading Level ·
3.1.6 Pronunciation · 3.2.5 Change on Request · 3.3.5 Help · 3.3.6 Error Prevention (All) · 3.3.9 Accessible
Authentication (Enhanced)*(2.2 신규)* · 4.1.1 Parsing *(2.2에서 폐지, §1 참조)*

## 4. 출처

- W3C, "Web Content Accessibility Guidelines (WCAG) 2.2", W3C Recommendation, 2023-10-05.
  https://www.w3.org/TR/WCAG22/ (확인일 2026-09-04)
- W3C, "What's New in WCAG 2.2" (SC 목록 변경 이력). https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- KWCAG 2.2 원문·비공식 HTML판·웹소울랩 — [kwcag22-checklist.md](kwcag22-checklist.md) 상단 출처 참조.

이 표는 W(설계·검증 축)가 작성한 해석이며, KWCAG 2.2 공식 해설서·인증기관 공지로 교차 확인되기
전까지 `needsVerification`이 붙은 항목은 잠정치로 취급한다.
