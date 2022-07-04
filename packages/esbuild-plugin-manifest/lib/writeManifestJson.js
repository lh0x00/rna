import path from 'path';
import { writeFile } from 'fs/promises';

/**
 * Write manifest.json
 * @param {import('esbuild').BuildOptions} options Build options.
 * @param {import('esbuild').BuildResult} result The build result.
 * @param {string} jsonPath The output file name.
 */
export async function writeManifestJson(options, result, jsonPath) {
    const { metafile } = result;
    if (!metafile) {
        return;
    }

    const workingDir = options.absWorkingDir || process.cwd();
    const publicPath = options.publicPath || '/';
    const outputDir = options.outdir ? options.outdir : options.outfile ? path.dirname(options.outfile) : workingDir;
    const outputFile = path.join(outputDir, jsonPath);

    const { outputs } = metafile;
    const manifestJson = Object.entries(outputs)
        .reduce((json, [fileName, output]) => {
            const outputFile = path.join(publicPath, path.relative(outputDir, fileName));

            if (fileName.endsWith('.map')) {
                const entry = outputs[fileName.replace(/\.map$/, '')].entryPoint;
                if (entry) {
                    json[path.join(path.dirname(fileName), `${path.basename(entry)}.map`)] = outputFile;
                }

                return json;
            }

            const entry = output.entryPoint || Object.keys(output.inputs)[0] || undefined;
            if (entry) {
                json[path.join(path.dirname(fileName), path.basename(entry))] = outputFile;
            }
            return json;
        }, /** @type {{[file: string]: string}} */ ({}));

    await writeFile(outputFile, JSON.stringify(manifestJson, null, 2));
}
