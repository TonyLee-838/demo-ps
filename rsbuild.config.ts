import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  performance: {
    chunkSplit: {
      strategy: "all-in-one",
    },
  },
  tools: {
    rspack: {
      target: "web",
    },
  },
  output: {
    filenameHash: false,
    polyfill: "entry",

    externals: {
      uxp: "commonjs2 uxp",
      photoshop: "commonjs2 photoshop",
      os: "commonjs2 os",
    },
    copy: [{ from: "manifest.json" }, { from: "icons", to: "icons" }],
    distPath: {
      js: "",
      css: "",
      html: "",
    },
  },

  dev: {
    writeToDisk: true,
  },
  source: {},

  plugins: [pluginReact()],
});
