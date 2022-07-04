import path from 'path';
import { rm, mkdir, writeFile } from 'fs/promises';
import { mapEntrypoints } from '@chialab/esbuild-plugin-manifest';

/**
 * Write entrypoints.json for dev server
 * @param {string[]} entrypoints The build entrypoints.
 * @param {string} outputFile The output file or dir.
 * @param {import('@web/dev-server-core').ServerStartParams} server The server instance.
 * @param {import('esbuild').Format} format The output format.
 */
async function writeDevEntrypointsJson(entrypoints, outputFile, server, format) {
    const { config } = server;
    const base = `http${config.http2 ? 's' : ''}://${config.hostname ?? 'localhost'}:${config.port}`;
    const outputDir = path.extname(outputFile) ? path.dirname(outputFile) : outputFile;
    const webSocketImport = server.webSockets && server.webSockets.webSocketImport && new URL(server.webSockets.webSocketImport, base).href;
    outputFile = path.extname(outputFile) ? outputFile : path.join(outputDir, 'entrypoints.json');

    const entrypointsJson = mapEntrypoints({ format }, (entrypoint) =>
        new URL(path.relative(config.rootDir, entrypoint), base).href
    );

    await rm(outputDir, { recursive: true, force: true });
    await mkdir(outputDir, { recursive: true });
    await writeFile(outputFile, JSON.stringify({
        entrypoints: entrypointsJson,
        server: {
            origin: base,
            port: config.port,
            inject: [
                webSocketImport,
            ],
        },
    }, null, 2));
}

/**
 * @param {import('@chialab/rna-config-loader').Entrypoint[]} [entrypoints]
 */
export function entrypointsPlugin(entrypoints = []) {
    /**
     * @type {import('@web/dev-server-core').Plugin}
     */
    const plugin = {
        name: 'rna-entrypoints',

        async serverStart(serverStartParams) {
            if (entrypoints) {
                await Promise.all(
                    entrypoints.map(async ({ input, entrypointsPath }) => {
                        if (!entrypointsPath) {
                            return;
                        }

                        const files = Array.isArray(input) ? input : [input];
                        await writeDevEntrypointsJson(files, entrypointsPath, serverStartParams, 'esm');
                    })
                );
            }
        },
    };

    return plugin;
}
