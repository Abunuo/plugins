import { PluginOption } from "vite";
interface AssetTransformCDNOptions {
    name?: ((match: string) => string) | string;
    includes?: RegExp | RegExp[];
    publicUrl?: string;
}
declare const vitePluginAssetTransformCDN: (options?: AssetTransformCDNOptions) => PluginOption;
export default vitePluginAssetTransformCDN;
