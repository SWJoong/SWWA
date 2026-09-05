// 정적 검사 워커 엔트리(03 §5.1). runStatic이 dist/engine/static-worker.js로 스폰한다.
// workerData로 입력을 받아 검사 후 결과를 한 번 postMessage하고 종료한다. 타임아웃 초과 시
// 메인 스레드가 worker.terminate()로 강제 종료하므로, 여기서는 별도 타임아웃을 두지 않는다.
import { parentPort, workerData } from "node:worker_threads";
import { runStaticFromWorkerInput, type StaticWorkerInput } from "./static.js";

async function main(): Promise<void> {
  if (!parentPort) return;
  try {
    const result = await runStaticFromWorkerInput(workerData as StaticWorkerInput);
    parentPort.postMessage({ ok: true, result });
  } catch (err) {
    parentPort.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
}

void main();
