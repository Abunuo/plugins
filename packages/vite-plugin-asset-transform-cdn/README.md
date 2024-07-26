# vite-plugin-asset-transform-cdn <a href="https://www.npmjs.com/package/vite-plugin-asset-transform-cdn"><img src="https://img.shields.io/npm/v/vite-plugin-asset-transform-cdn" alt="npm package"></a>

> vite 插件，支持构建时将资源替换成 cdn 地址

## Install

```sh
npm i --save-dev vite-plugin-asset-transform-cdn # yarn/pnpm add -D vite-plugin-asset-transform-cdn
```

## Usage

```typescript
// vite.config.js
import vitePluginAssetTransformCDN from "vite-plugin-asset-transform-cdn"

export default {
  plugins: [vitePluginAssetTransformCDN({
    // name?: ((match: string) => string) | string;
    // includes?: RegExp | RegExp[];
    // publicUrl?: string;
  })],
}
```
