import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";
import { loadDataBundle } from "../../src/data/loader.js";

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  for (const close of cleanups.splice(0)) await close();
});

/** 서버·클라이언트를 인메모리로 연결한다(실제 assets/*.json 데이터 사용). */
export async function connectClient(): Promise<Client> {
  const data = loadDataBundle();
  const server = createServer(data);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  cleanups.push(async () => {
    await client.close();
    await server.close();
  });
  return client;
}
