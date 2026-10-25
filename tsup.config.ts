import { defineConfig } from "tsup";

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
});
