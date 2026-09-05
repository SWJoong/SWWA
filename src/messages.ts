/**
 * 사용자 대면 문자열(규칙 메시지·fix 안내)을 이 파일에 집중시킨다(03 §1). 도구 오류 문구는
 * 각 tools/*.ts가 직접 담당한다(오류 코드별로 짧고 도구에 종속적이라 여기 두지 않는다).
 */

export const altMeaningless = {
  message: (alt: string): string => `이미지의 대체 텍스트가 적절하지 않습니다("${alt}").`,
  fix: 'alt 속성에 이미지의 의미나 용도를 설명하는 텍스트를 넣으세요. 순수 장식용 이미지라면 alt=""로 비워 두세요.',
};

export const mediaTrack = {
  message: "동영상에 자막 트랙이 없습니다.",
  fix: '<track kind="captions" src="자막.vtt" srclang="ko">를 <video> 안에 추가하세요.',
};

export const tableCaption = {
  message: "데이터 표에 caption이 없습니다.",
  fix: "<table> 바로 안에 <caption>표 제목</caption>을 추가하세요.",
};

export const tableThMissing = {
  message: "데이터 표에 제목 셀(th)이 없습니다.",
  fix: "열 또는 행의 첫 셀을 <th scope=\"col\">(또는 scope=\"row\")로 바꾸세요.",
};

export const tabindexPositive = {
  message: (value: string): string => `tabindex="${value}"처럼 양수 tabindex는 초점 순서를 예측하기 어렵게 만듭니다.`,
  fix: "tabindex는 0 또는 -1만 사용하고, 초점 순서는 DOM 순서로 조정하세요.",
};

export const autoplayMedia = {
  message: "음소거 없이 자동 재생되는 미디어가 있습니다.",
  fix: "autoplay를 제거하거나 muted 속성을 추가하세요.",
};

export const mouseOnlyHandler = {
  message: "클릭 핸들러만 있고 키보드로 접근할 수 없는 요소입니다.",
  fix: "button 등 네이티브 상호작용 요소를 쓰거나, tabindex=\"0\"과 role·keydown 핸들러를 추가하세요.",
};

export const skipLinkFirst = {
  message: "문서의 첫 초점 요소가 본문 바로가기 링크가 아닙니다.",
  fix: "페이지 최상단에 본문(#main 등)으로 이동하는 바로가기 링크를 첫 초점 요소로 추가하세요.",
};

export const skipTargetExists = {
  message: (href: string): string => `바로가기 링크의 대상(${href})이 문서에 없습니다.`,
  fix: "링크 href가 가리키는 id를 실제 요소에 부여하세요.",
};

export const titleGeneric = {
  message: (title: string): string => `문서 제목이 비어 있거나 무의미합니다("${title}").`,
  fix: "페이지 내용을 설명하는 구체적인 제목을 <title>에 넣으세요(예: \"2026년 예산안 - 사이트명\").",
};

export const iframeTitle = {
  message: "iframe에 title이 없거나 무의미합니다.",
  fix: 'iframe이 담고 있는 내용을 설명하는 title 속성을 추가하세요(예: title="찾아오시는 길 지도").',
};

export const linkTextGeneric = {
  message: (text: string): string => `링크 텍스트가 일반적이라 목적을 알 수 없습니다("${text}").`,
  fix: "링크 텍스트에 목적지·내용을 포함시키거나 aria-label로 보완하세요.",
};

export const langKoExpected = {
  message: (lang: string): string => `본문이 대부분 한국어인데 html lang="${lang}"입니다.`,
  fix: '<html lang="ko">로 지정하세요.',
};

export const newWindowNotice = {
  message: "새 창으로 열리는 링크에 안내가 없습니다.",
  fix: '링크 텍스트·aria-label 등에 "(새 창)" 안내를 추가하세요.',
};

export const selectOnchange = {
  message: "select의 onchange가 페이지 이동·제출을 일으키는 것으로 보입니다(수동 확인 필요).",
  fix: "select 변경만으로 이동·제출하지 말고, 별도의 확인 버튼을 함께 제공하세요.",
};

export const placeholderOnlyLabel = {
  message: "입력 필드에 placeholder만 있고 레이블이 없습니다.",
  fix: "<label for>·aria-label·aria-labelledby 중 하나로 레이블을 연결하세요.",
};

export const captchaDetect = {
  message: "캡차로 보이는 인증 수단이 감지되었습니다(대체 인증 수단 수동 확인 필요).",
  fix: "이미지 캡차만 제공하지 말고 오디오 캡차 등 대체 인증 수단을 함께 제공하세요.",
};

export const bFocusVisible = {
  message: "초점을 받아도 시각적으로 구별되는 스타일 변화가 없습니다.",
  fix: ":focus 또는 :focus-visible에 outline·box-shadow 등 눈에 띄는 스타일을 추가하세요.",
};

export const bFocusOrder = {
  message: "키보드 초점 순서가 문서(DOM) 순서와 어긋납니다.",
  fix: "tabindex 양수값 사용을 피하고 DOM 순서로 자연스러운 초점 이동이 되도록 조정하세요.",
};

export const bSkipLinkWorks = {
  message: "본문 바로가기 링크를 실행해도 초점이 대상으로 이동하지 않습니다.",
  fix: '바로가기 대상 요소에 tabindex="-1"을 추가해 프로그래밍적으로 초점을 받을 수 있게 하세요.',
};

export const bTargetSize = {
  message: (px: number): string => `상호작용 요소의 클릭 가능 영역이 너무 작습니다(대각선 약 ${px}px, 기준 22.7px 미만).`,
  fix: "버튼·링크 등의 클릭 가능 영역을 최소 24×24px(6mm) 이상으로 키우세요.",
};

export const bKeyboardReachable = {
  message: "클릭·역할(role)만으로 상호작용하는 요소가 Tab 순회로 접근되지 않습니다.",
  fix: 'tabindex="0"을 추가하고 키보드 이벤트(Enter·Space) 핸들러를 함께 구현하세요.',
};

export const bMotionRuntime = {
  message: "자동으로 계속 변경되는 콘텐츠에 정지·일시정지 컨트롤이 없습니다.",
  fix: '"일시정지" 버튼 등 사용자가 자동 변경을 멈출 수 있는 컨트롤을 추가하세요.',
};

export const parseErrors: Record<string, { message: string; fix: string }> = {
  "duplicate-attribute": {
    message: "같은 속성이 한 태그에 중복 선언되었습니다.",
    fix: "중복된 속성 중 하나만 남기세요.",
  },
  "end-tag-with-attributes": {
    message: "닫는 태그에 속성이 있습니다.",
    fix: "닫는 태그(</tag>)에는 속성을 쓰지 마세요.",
  },
  "end-tag-without-matching-open-element": {
    message: "짝이 맞지 않는 닫는 태그가 있습니다.",
    fix: "여는 태그와 순서·짝을 맞추세요.",
  },
  "closing-of-element-with-open-child-elements": {
    message: "자식 요소가 열려 있는 상태에서 부모 요소가 닫혔습니다(태그 중첩 오류).",
    fix: "태그를 연 순서의 역순으로 닫으세요.",
  },
  "unexpected-character-in-attribute-name": {
    message: "속성 이름에 예상치 못한 문자가 있습니다.",
    fix: "속성 이름·값 앞뒤에 공백·따옴표를 올바르게 넣으세요.",
  },
  "missing-attribute-value": {
    message: "속성 값이 비어 있습니다.",
    fix: '속성에 값을 지정하세요(예: attr="value").',
  },
};
