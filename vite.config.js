import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { createHtmlPlugin } from "vite-plugin-html";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      minify: true,
    }),
    ViteMinifyPlugin({}),
    visualizer({
      filename: "./dist/stats.html",
      template: "treemap",
      sourcemap: true,
    }),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
        cssnano({
          preset: "default",
        }),
      ],
    },
  },
  build: {
    minify: "terser", // Can also be 'esbuild' for faster builds, but 'terser' offers more comprehensive minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },
});
