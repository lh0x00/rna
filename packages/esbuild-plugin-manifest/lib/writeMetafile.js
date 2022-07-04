import path from 'path';
import { writeFile } from 'fs/promises';

/**
 * Writes a JSON file with the metafile contents, for bundle analysis.
 *
 * @param {import('esbuild').BuildOptions} options Build options.
 * @param {{ metafile?: import('esbuild').Metafile }} result The build result.
 * @param {string} jsonPath The output file name.
 */
export function writeMetafile(options, result, jsonPath) {
    const { metafile } = result;
    if (!metafile) {
        return;
    }

    const workingDir = options.absWorkingDir || process.cwd();
    const outputDir = options.outdir ? options.outdir : options.outfile ? path.dirname(options.outfile) : workingDir;
    const outputFile = path.join(outputDir, jsonPath);

    return writeFile(outputFile, JSON.stringify(metafile));
}
