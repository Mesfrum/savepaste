import { defineConfig, type Plugin } from "vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { createHtmlPlugin } from "vite-plugin-html";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import { resolve } from "path";
import compression from "vite-plugin-compression";

// Feature flag for the text dedup page. Off unless ENABLE_TEXT_PAGE=true.
const enableTextPage = process.env.ENABLE_TEXT_PAGE === "true";

// Strips <!-- feature:text --> ... <!-- /feature:text --> blocks when the flag is off.
const textPageFlag = (): Plugin => ({
  name: "text-page-flag",
  transformIndexHtml: {
    order: "pre",
    handler: (html) =>
      enableTextPage
        ? html
        : html.replace(/<!-- feature:text -->[\s\S]*?<!-- \/feature:text -->/g, ""),
  },
});

export default defineConfig({
  base: "/",
  plugins: [
    textPageFlag(),
    createHtmlPlugin({
      minify: true,
    }),
    compression({
      algorithm: "brotliCompress",
      deleteOriginFile: false,
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
        ...(enableTextPage && { text: resolve(__dirname, "text.html") }),
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
