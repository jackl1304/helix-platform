import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins:[tsconfigPaths()],
  resolve:{ extensions:[".tsx",".ts",".jsx",".js",".json"] },
  test:{
    globals:true,
    environment:"jsdom",
    environmentMatchGlobs:[
      ["server/**","node"],
      ["backend/**","node"]
    ],
    setupFiles:["./vitest.setup.ts","./server/tests/vitest.server.setup.ts"]
  }
});
