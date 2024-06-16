"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const tailwindcss_1 = __importDefault(require("tailwindcss"));
const autoprefixer_1 = __importDefault(require("autoprefixer"));
const cssnano_1 = __importDefault(require("cssnano"));
const vite_plugin_html_1 = require("vite-plugin-html");
const vite_plugin_minify_1 = require("vite-plugin-minify");
const path_1 = require("path");
const vite_plugin_compression_1 = __importDefault(require("vite-plugin-compression"));
exports.default = (0, vite_1.defineConfig)({
    base: '/',
    plugins: [
        (0, vite_plugin_html_1.createHtmlPlugin)({
            minify: true,
        }),
        (0, vite_plugin_compression_1.default)({
            algorithm: "brotliCompress",
            deleteOriginFile: false, // Keep the original assets
        }),
        (0, vite_plugin_minify_1.ViteMinifyPlugin)({}),
    ],
    css: {
        postcss: {
            plugins: [
                (0, tailwindcss_1.default)(),
                (0, autoprefixer_1.default)(),
                (0, cssnano_1.default)({
                    preset: "default",
                }),
            ],
        },
    },
    build: {
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        rollupOptions: {
            input: {
                main: (0, path_1.resolve)(__dirname, "index.html"),
            },
            external: [(0, path_1.resolve)(__dirname, "temp/**")],
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
