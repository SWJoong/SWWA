export function startFixtureServer(preferredPort?: number): Promise<{ port: number; close: () => Promise<void> }>;
