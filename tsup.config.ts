import { defineConfig } from "tsup";

export default defineConfig(options => {
    return {
      entry: ["src/index.ts"],
      splitting: false,
      sourcemap: false,
      clean: true,
      dts: !options.watch,
      format: ['esm']
    };
});
