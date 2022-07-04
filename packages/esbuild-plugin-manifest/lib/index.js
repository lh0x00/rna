import { writeManifestJson } from './writeManifestJson.js';
import { mapEntrypoints, writeEntrypointsJson } from './writeEntrypointsJson.js';
import { writeMetafile } from './writeMetafile.js';

export { writeManifestJson, mapEntrypoints, writeEntrypointsJson, writeMetafile };

/**
 * A plugin for esbuild that enables automatic injection of the jsx module import.
 * @param {{ manifestPath?: string, entrypointsPath?: string, metafilePath?: string }} opts
 * @returns An esbuild plugin.
 */
export default function(opts = {}) {
    const {
        manifestPath = 'manifest.json',
        entrypointsPath,
        metafilePath,
    } = opts;

    /**
     * @type {import('esbuild').Plugin}
     */
    const plugin = {
        name: 'manifest',
        setup(build) {
            build.initialOptions.metafile = true;

            build.onEnd(async (buildResult) => {
                if (manifestPath) {
                    await writeManifestJson(build.initialOptions, buildResult, manifestPath);
                }
                if (entrypointsPath) {
                    await writeEntrypointsJson(build.initialOptions, buildResult, entrypointsPath);
                }
                if (metafilePath) {
                    await writeMetafile(build.initialOptions, buildResult, metafilePath);
                }
            });
        },
    };

    return plugin;
}
