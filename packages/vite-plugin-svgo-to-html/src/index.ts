import { PluginOption } from "vite";
import { generateFilePath, generateScriptContent, svgFind } from "./utils";

interface vitePluginSvgoToHtmlOptions {
  includes: string; // 匹配 svg 文件目录
  fileName?: string; // 生成文件名
  perfix?: string; // svg id 前缀
}

const vitePluginSvgoToHtml: (options: vitePluginSvgoToHtmlOptions) => PluginOption = ({ includes, fileName: fName, perfix = "" }) => {
  if (!includes) {
    throw new Error(`[ERROR: vitePluginSvgoToHtml]: includes is required!`)
  }
  let config: any;
  try {
    const svgDom = svgFind(includes, perfix).reduce((insertHtml, svghtml) => insertHtml + svghtml, "");
    const { hash, code } = generateScriptContent(svgDom);
    const fileName = fName || `svgo-${hash}.js`;
    return {
      name: "vite-plugin-svgo-to-html",
      load(id) {
        if (id.endsWith(fileName)) {
          return code;
        }
      },
      configResolved(cfg) {
        config = cfg;
      },
      generateBundle(options, bundle) {
        const { path: scriptSrc } = generateFilePath(config, fileName);
        // 构建时输出文件到资源目录
        bundle[scriptSrc] = {
          name: fileName,
          needsCodeReference: false,
          fileName: scriptSrc,
          source: code,
          type: "asset",
        };
      },
      // writeBundle() {
      //   if (config.command === "build") {
      //     const writePath = nodePath.resolve(config.build.outDir, config.build.assetsDir, fileName);
      //     writeFileSync(writePath, scriptContent, "utf-8");
      //   }
      // },
      transformIndexHtml(dom) {
        const { src } = generateFilePath(config, fileName);
        return {
          html: dom,
          tags: [
            {
              tag: "script",
              attrs: {
                type: "text/javascript",
                src,
              },
              injectTo: "body",
            },
          ],
        };
      },
    };
  } catch (error) {
    throw new Error(`[ERROR: vitePluginSvgoToHtml compile]: ${error}`);
  }
};

export default vitePluginSvgoToHtml;
