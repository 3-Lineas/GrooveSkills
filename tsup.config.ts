import { defineConfig } from "tsup";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  entry: {
    cli: "bin/cli.ts",
    main: "src/main.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  minify: false,
  sourcemap: true,
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
});
