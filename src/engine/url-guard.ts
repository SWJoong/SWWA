// audit_url이 허용하는 스킴·호스트를 검사한다(NFR-07). localhost·사설 IP는 로컬 개발 서버
// 감사가 1차 시나리오이므로 허용하고, 링크-로컬·클라우드 메타데이터 호스트만 차단한다.
const BLOCKED_HOSTS = new Set(["metadata.google.internal"]);
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "file:"]);

export class BlockedUrlError extends Error {}

function isLinkLocalV4(hostname: string): boolean {
  return /^169\.254\.\d{1,3}\.\d{1,3}$/.test(hostname);
}

function isBlockedV6(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h.startsWith("fe80:") || /^fd[0-9a-f]{2}:/.test(h) || h === "::ffff:169.254.169.254";
}

/** 스킴·호스트를 검사하고 통과하면 URL을 반환한다. 차단 시 BlockedUrlError를 던진다. */
export function assertUrlAllowed(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new BlockedUrlError(`URL을 해석할 수 없습니다: ${rawUrl}`);
  }
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new BlockedUrlError(`허용되지 않는 스킴입니다: ${url.protocol}`);
  }
  if (url.protocol === "file:") return url; // 로컬 파일은 호스트 개념이 없다

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTS.has(hostname.toLowerCase())) {
    throw new BlockedUrlError(`차단된 호스트입니다: ${hostname}`);
  }
  if (isLinkLocalV4(hostname) || isBlockedV6(hostname)) {
    throw new BlockedUrlError(`링크-로컬·메타데이터 호스트는 차단됩니다: ${hostname}`);
  }
  return url;
}
