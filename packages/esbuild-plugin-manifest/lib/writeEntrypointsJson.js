import path from 'path';
import { mkdir, writeFile } from 'fs/promises';

/**
 * Map build entrypoints to entrypoints.json
 * @param {import('esbuild').BuildOptions} options Build options.
 * @param {(entrypoint: string) => string} resolve The resolution callback for the endpoint.
 */
export function mapEntrypoints(options, resolve = (entrypoint) => entrypoint) {
    const entrypoints = Array.isArray(options.entryPoints) ?
        options.entryPoints :
        Object.values(options.entryPoints || {});

    return entrypoints.reduce((json, entrypoint) => {
        const extname = path.extname(entrypoint);
        const basename = path.basename(entrypoint, extname);
        const loader = (options.loader || {})[extname] || 'tsx';
        const map = json[basename] = json[basename] || {
            format: options.format,
            js: [],
            css: [],
        };

        const outputFile = resolve(entrypoint);

        switch (loader) {
            case 'css': {
                map.css.push(outputFile);
                break;
            }
            default: {
                map.js.push(outputFile);
                break;
            }
        }

        return json;
    }, /** @type {{[file: string]: { js: string[], css: string[] }}} */({}));
}

/**
 * Write entrypoints.json
 * @param {import('esbuild').BuildOptions} options Build options.
 * @param {import('esbuild').BuildResult} result The build result.
 * @param {string} jsonPath The output file name.
 */
export async function writeEntrypointsJson(options, result, jsonPath) {
    const { metafile } = result;
    if (!metafile) {
        return;
    }

    const { outputs } = metafile;
    const workingDir = options.absWorkingDir || process.cwd();
    const publicPath = options.publicPath || '/';
    const outputsByEntrypoint = Object.keys(outputs)
        .reduce((map, outputName) => {
            const output = outputs[outputName];
            if (!output.entryPoint) {
                return map;
            }
            map[path.resolve(workingDir, output.entryPoint)] = path.resolve(workingDir, outputName);

            return map;
        }, /** @type {{ [key: string]: string }} */({}));

    const outputDir = options.outdir ? options.outdir : options.outfile ? path.dirname(options.outfile) : workingDir;
    const outputFile = path.join(outputDir, jsonPath);
    const entrypointsJson = mapEntrypoints(options, (entrypoint) =>
        path.join(publicPath, path.relative(outputDir, outputsByEntrypoint[path.resolve(workingDir, entrypoint)]))
    );

    await mkdir(path.dirname(outputFile), { recursive: true });
    await writeFile(outputFile, JSON.stringify({ entrypoints: entrypointsJson }, null, 2));
}
