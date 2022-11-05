import { defineConfig } from "tsup";

export default defineConfig(options => {
    return {
      entry: ["src/index.ts"],
      splitting: false,
      sourcemap: false,
      clean: true,
      format: ['esm', 'cjs'],
      target: 'node16'
    };
});
