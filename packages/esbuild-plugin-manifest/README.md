<p align="center">
    <strong>esbuild-plugin-manifest</strong> • Generate a JSON manifest of the build for other tools integration.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@chialab/esbuild-plugin-manifest"><img alt="NPM" src="https://img.shields.io/npm/v/@chialab/esbuild-plugin-manifest.svg?style=flat-square"></a>
</p>

---

## Install

```sh
$ npm i @chialab/esbuild-plugin-manifest -D
$ yarn add @chialab/esbuild-plugin-manifest -D
```

## Usage

```js
import esbuild from 'esbuild';
import manifestPlugin from '@chialab/esbuild-plugin-manifest';

await esbuild.build({
    plugins: [
        manifestPlugin(),
    ],
});

```

---

## License

**esbuild-plugin-manifest** is released under the [MIT](https://github.com/chialab/rna/blob/main/packages/esbuild-plugin-manifest/LICENSE) license.
