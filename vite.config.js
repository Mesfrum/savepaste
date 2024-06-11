import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { createHtmlPlugin } from "vite-plugin-html";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import { resolve } from "path";
import compression from "vite-plugin-compression";

export default defineConfig({
  base: '/savepaste.com/', 
  plugins: [
    createHtmlPlugin({
      minify: true,
    }),
    compression({
      algorithm: "brotliCompress",
      deleteOriginalAssets: false, // Keep the original assets
    }),
    ViteMinifyPlugin({}),
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
      input: {
        main: resolve(__dirname, "index.html"),
      },
      external: [resolve(__dirname, "temp/**")],
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
