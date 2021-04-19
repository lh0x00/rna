import { promises } from 'fs';
import path from 'path';
import MagicString from 'magic-string';
import glob from 'fast-glob';

const { readFile } = promises;

const WEBPACK_INCLUDE_REGEX = /import\(\s*\/\*\s*webpackInclude:\s*([^\s]+)\s\*\/(?:\s*\/\*\s*webpackExclude:\s*([^\s]+)\s\*\/)?[^`]*`([^$]*)\${([^}]*)}[^`]*`\)/g;
const SCRIPT_LOADERS = ['tsx', 'ts', 'jsx', 'js'];

/**
 * A plugin that converts the `webpackInclude` syntax.
 * @return An esbuild plugin.
 */
export function webpackIncludePlugin() {
    /**
     * @type {import('esbuild').Plugin}
     */
    const plugin = {
        name: 'webpack-include',
        setup(build) {
            let options = build.initialOptions;
            let loaders = options.loader || {};
            let keys = Object.keys(loaders);
            let tsxExtensions = keys.filter((key) => SCRIPT_LOADERS.includes(loaders[key]));
            let tsxRegex = new RegExp(`\\.(${tsxExtensions.map((ext) => ext.replace('.', '')).join('|')})$`);

            build.onLoad({ filter: tsxRegex, namespace: 'file' }, async ({ path: filePath }) => {
                let ext = path.extname(filePath);
                if (!keys.includes(ext)) {
                    return;
                }

                let contents = await readFile(filePath, 'utf-8');
                if (!contents.match(WEBPACK_INCLUDE_REGEX)) {
                    return;
                }

                let magicCode = new MagicString(contents);
                let match = WEBPACK_INCLUDE_REGEX.exec(contents);
                while (match) {
                    let include = new RegExp(match[1].substr(1, match[1].length - 2));
                    let exclude = match[2] && new RegExp(match[2].substr(1, match[2].length - 2));
                    let initial = match[3] || './';
                    let identifier = match[4];
                    let map = (await glob(`${initial}*`, {
                        cwd: path.dirname(filePath),
                    }))
                        .filter((name) => name.match(include) && (!exclude || !name.match(exclude)))
                        .reduce((map, name) => {
                            map[name.replace(include, '')] = `./${path.join(initial, name)}`;
                            return map;
                        }, /** @type {{ [key: string]: string }} */ ({}));

                    magicCode.overwrite(
                        match.index,
                        match.index + match[0].length,
                        `({ ${Object.keys(map).map((key) => `'${key}': import('${map[key]}')`).join(', ')} })[${identifier}]()`
                    );

                    match = WEBPACK_INCLUDE_REGEX.exec(contents);
                }

                let magicMap = magicCode.generateMap({ hires: true });
                let magicUrl = `data:application/json;charset=utf-8;base64,${Buffer.from(magicMap.toString()).toString('base64')}`;

                return {
                    contents: `${magicCode.toString()}//# sourceMappingURL=${magicUrl}`,
                };
            });
        },
    };

    return plugin;
}
