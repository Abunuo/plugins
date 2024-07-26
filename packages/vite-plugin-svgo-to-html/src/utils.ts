import { normalizePath } from "vite"
import UglifyJS from "uglify-js"
import { Dirent, readFileSync, readdirSync } from "fs"
import crypto from "crypto"

const svgTitle = /<svg([^>+].*?)>/
const clearHeightWidth = /(width|height)="([^>+].*?)"/g
const hasViewBox = /(viewBox="[^>+].*?")/g
const clearReturn = /(\r)|(\n)/g
const excludeFile = /(\.DS_Store)/g // 排除文件(.DS_Store)

/**
 * @description: 输出svg目录
 * @param {string} rootPath
 * @param {string} idPerfix
 * @return {string[]} svg内容集合
 */
export const svgFind = (rootPath: string, idPerfix: string = "") => {
	const arr: string[] = []
	const dirents = readdirSync(rootPath, { withFileTypes: true })
	const replaceFn = (dirent: Dirent) => (_$1: string, $2: string) => {
		let width = 0
		let height = 0
		let content = $2.replace(clearHeightWidth, (_s1, s2, s3) => {
			if (s2 === "width") width = s3
			else if (s2 === "height") height = s3
			return ""
		})
		if (!hasViewBox.test($2)) content += `viewBox="0 0 ${width} ${height}"`
		return `<symbol id="${idPerfix ? idPerfix + "-" : ""}${dirent.name.replace(".svg", "")}" ${content} >`
	}
	for (const dirent of dirents) {
		if (dirent.isDirectory()) arr.push(...svgFind(rootPath + dirent.name + "/"))
		else if (!excludeFile.test(dirent.name) && dirent.name.endsWith(".svg")) {
			const svg = readFileSync(rootPath + dirent.name)
				.toString()
				.replace(clearReturn, "")
				.replace(svgTitle, replaceFn(dirent))
				.replace(/<([a-zA-Z0-9]+)([^>]*)\/>/g, "<$1 $2></$1>")
				.replace("</svg>", "</symbol>")
			arr.push(svg)
		}
	}
	return arr
}

/**
 * @description: 脚本文件
 * @param {string} svgDom
 * @return {string}
 */
export const generateScriptContent = (svgDom: string) => {
	const scriptContent = `
    const insertHtml = \`${svgDom}\`;
    const loadSvg = () => {
      const SvgXml = document.createElementNS('http://www.w3.org/2000/svg','svg');
      SvgXml.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      SvgXml.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      SvgXml.setAttribute("aria-hidden", "true");
      SvgXml.setAttribute("style", "position: absolute; width: 0; height: 0; overflow: hidden;");
      SvgXml.innerHTML = insertHtml;
      document.body.insertBefore(SvgXml, document.body.firstChild);
      document.removeEventListener("DOMContentLoaded", loadSvg);
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", loadSvg);
    } else {
      loadSvg();
    };
  `;
	const { code } = UglifyJS.minify(scriptContent)
	const hash = crypto
		.createHash("md5")
		.update(code)
		.digest("base64")
		.slice(0, 8)
	return {
		hash,
		code,
	}
}

/**
 * @description: 获取不同环境下资源路径
 * @param {any} config - vite config
 * @param {string} fileName
 * @return {*}
 */
export const generateFilePath = (config: any, fileName: string) => {
	const path = normalizePath(
		`./${config?.build?.assetsDir ?? "assets"}/${fileName}`
	)
	return {
		path,
		src: config.base + path,
	}
}
