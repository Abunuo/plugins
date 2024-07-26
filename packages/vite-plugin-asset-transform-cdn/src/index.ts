/*
 * @Date: 2024-06-28 17:49:27
 * @Description: 构建时将资源地址替换成 CDN
 */

import { PluginOption } from "vite";

interface AssetTransformCDNOptions {
  name?: ((match: string) => string) | string;
  includes?: RegExp | RegExp[];
  publicUrl?: string;
}

const virtualId = "\0virtual:asset-cdn:";

const transformOptions = (config: any, options?: AssetTransformCDNOptions) => {
  let includes: RegExp[] = [];

  if (options?.includes) {
    includes = Array.isArray(options.includes) ? options.includes : [options.includes];
  }

  let publicUrl: string = config.build.assetsDir + "/";

  if (options?.publicUrl) {
    publicUrl = options.publicUrl.endsWith("/") ? options.publicUrl : options.publicUrl + "/";
  }

  return {
    includes,
    publicUrl,
  };
};

const vitePluginAssetTransformCDN: (options?: AssetTransformCDNOptions) => PluginOption = (options) => {
  let config: any;

  return {
    name: "vite-plugin-asset-transform-CDN",
    apply: "build",
    enforce: "pre",
    configResolved(cfg) {
      config = cfg;
    },
    resolveId(id) {
      let match: any;
      const { includes } = transformOptions(config, options);
      for (let i = 0; i < includes.length; i++) {
        match = includes[i].test(id);
        if (match) break;
      }
      if (match) {
        const fileName = typeof options?.name === "function" ? options?.name(id) : id.split("/").pop();
        return virtualId + fileName;
      }
    },
    load(id) {
      if (id.includes(virtualId)) {
        const { publicUrl } = transformOptions(config, options);
        return `export default "${id.replace(virtualId, publicUrl)}"`;
      }
    },
  };
};

export default vitePluginAssetTransformCDN;
