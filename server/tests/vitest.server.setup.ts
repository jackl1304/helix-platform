import { beforeAll, afterAll, vi } from "vitest";
let exitSpy: ReturnType<typeof vi.spyOn>;
beforeAll(() => {
  exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
    throw new Error(`process.exit called with ${code}`);
  }) as any);
});
afterAll(() => { exitSpy.mockRestore(); });
