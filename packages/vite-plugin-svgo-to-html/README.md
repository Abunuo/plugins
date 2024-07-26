# vite-plugin-svgo-to-html <a href="https://www.npmjs.com/package/vite-plugin-svgo-to-html"><img src="https://img.shields.io/npm/v/vite-plugin-svgo-to-html" alt="npm package"></a>

> vite 插件，支持提取指定 svg 文件并在运行时插入到 html 中
> *：server 时，不会生成独立文件，只有在 build 才会输出文件

## Install

```sh
npm i --save-dev vite-plugin-svgo-to-html # yarn/pnpm add -D vite-plugin-svgo-to-html
```

## Usage

```typescript
// vite.config.js
import vitePluginSvgoToHtml from "vite-plugin-svgo-to-html";

export default {
  plugins: [vitePluginSvgoToHtml({
    // includes: string; // required 匹配 svg 文件目录
    // fileName?: string; // 生成文件名, default: svg-script-[hash:8].js
    // perfix?: string; // svg id 前缀
  })]
}
```

```html
  <svg>
    <use xlink-href="#[fileName]" />
  </svg>
```
