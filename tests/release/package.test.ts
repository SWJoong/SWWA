import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * T-11 · 릴리스 준비성 계약(배포 파이프라인, 05-release-plan). npm publish·npx 설치가 성립하는
 * 최소 조건을 package.json·번들 파일로 고정한다(회귀 가드). 실제 publish 워크플로는 T-12(U).
 */
const root = (p: string): string => fileURLToPath(new URL(`../../${p}`, import.meta.url));

interface Pkg {
  name: string;
  version: string;
  type?: string;
  license?: string;
  author?: string;
  homepage?: string;
  repository?: { url?: string };
  bugs?: { url?: string };
  bin?: Record<string, string>;
  files?: string[];
  engines?: Record<string, string>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  publishConfig?: { access?: string; provenance?: boolean };
}
const pkg = JSON.parse(readFileSync(root("package.json"), "utf8")) as Pkg;

describe("릴리스 준비성 (package.json·번들, T-11)", () => {
  it("TC-REL-01: 패키지 식별 — name·semver·MIT·ESM", () => {
    expect(pkg.name).toBe("swwa-mcp");
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(pkg.license).toBe("MIT");
    expect(pkg.type).toBe("module");
  });

  it("TC-REL-02: npx 실행 — bin이 dist/index.js를 가리키고 소스 엔트리에 shebang이 있다", () => {
    expect(pkg.bin?.["swwa-mcp"]).toBe("dist/index.js");
    expect(readFileSync(root("src/index.ts"), "utf8").startsWith("#!/usr/bin/env node")).toBe(true);
  });

  it("TC-REL-03: files에 dist·assets·bin·문서가 포함된다", () => {
    const files = pkg.files ?? [];
    for (const f of ["dist", "assets", "bin", "README.md", "LICENSE"]) expect(files).toContain(f);
  });

  it("TC-REL-04: 런타임 의존성이 계획(03 §2)의 7종과 일치한다", () => {
    expect(Object.keys(pkg.dependencies ?? {}).sort()).toEqual([
      "@axe-core/playwright",
      "@modelcontextprotocol/sdk",
      "axe-core",
      "jsdom",
      "parse5",
      "playwright-core",
      "zod",
    ]);
  });

  it("TC-REL-05: 배포 설정 — engines.node·prepublishOnly 빌드·publishConfig public+provenance", () => {
    expect(pkg.engines?.node).toBeDefined();
    expect(pkg.scripts?.prepublishOnly ?? "").toContain("build");
    expect(pkg.publishConfig?.access).toBe("public");
    expect(pkg.publishConfig?.provenance).toBe(true);
  });

  it("TC-REL-06: provenance 배포 메타 — repository.url(SWWA)·bugs·homepage·author", () => {
    expect(pkg.repository?.url ?? "").toMatch(/github\.com\/SWJoong\/SWWA/);
    expect(pkg.bugs?.url ?? "").toMatch(/github\.com/);
    expect(pkg.homepage ?? "").toMatch(/github\.com/);
    expect((pkg.author ?? "").length).toBeGreaterThan(0);
  });

  it("TC-REL-07: 문서·번들 데이터 파일이 실제로 존재한다", () => {
    expect(existsSync(root("README.md"))).toBe(true);
    expect(existsSync(root("LICENSE"))).toBe(true);
    for (const a of ["kwcag22.json", "wcag22.json", "axe-rule-map.json", "certification.json", "sources.json"]) {
      expect(existsSync(root(`assets/${a}`))).toBe(true);
    }
  });

  it("TC-REL-08: 플러그인 매니페스트가 존재하고 이름이 swwa다", () => {
    const plugin = JSON.parse(readFileSync(root(".claude-plugin/plugin.json"), "utf8")) as { name: string };
    expect(plugin.name).toBe("swwa");
    expect(existsSync(root(".mcp.json"))).toBe(true);
  });

  it("TC-REL-09: npm pack에 dist·assets·bin이 포함되고 src·tests는 제외된다", () => {
    const out = execSync("npm pack --dry-run --json", { cwd: root("."), encoding: "utf8" });
    const files = (JSON.parse(out) as { files: { path: string }[] }[])[0]!.files.map((f) => f.path);
    expect(files).toContain("dist/index.js");
    expect(files).toContain("bin/swwa-mcp.mjs");
    expect(files).toContain("assets/kwcag22.json");
    expect(files.some((f) => f.startsWith("src/"))).toBe(false);
    expect(files.some((f) => f.startsWith("tests/"))).toBe(false);
  }, 30_000);
});
