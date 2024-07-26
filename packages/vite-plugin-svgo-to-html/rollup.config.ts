import { defineConfig } from "rollup"
import esbuild from "rollup-plugin-esbuild"
import dts from "rollup-plugin-dts"

type FormatType = "dts" | "cjs" | "esm"
const EXTENTIONS: Record<FormatType, string> = {
	cjs: "cjs",
	dts: "d.ts",
	esm: "mjs",
}

const bundle = (format: FormatType) => {
	const ext = EXTENTIONS[format]
	const file = `dist/index.${ext}`

	return defineConfig({
		input: "./src/index.ts",

		output: {
			file,
			sourcemap: false,
			format: format === "cjs" ? "umd" : "esm",
			exports: "named",
			name: "VitePluginSvgoToHtml",
			globals: name => name
		},

		plugins: format == "dts" ? [dts()] : [esbuild({ target: "esnext" })],
		external: id => !/^[./]/.test(id),
	})
}

export default [bundle("cjs"), bundle("esm"), bundle("dts")]
