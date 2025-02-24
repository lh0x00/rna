import esbuild from 'esbuild';
import htmlPlugin from '@chialab/esbuild-plugin-html';
import virtualPlugin from '@chialab/esbuild-plugin-virtual';
import { expect } from 'chai';

describe('esbuild-plugin-html', () => {
    it('should bundle webapp with scripts', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.iife.html', import.meta.url).pathname],
            sourceRoot: '/',
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, js, css] = outputFiles;

        expect(outputFiles).to.have.lengthOf(3);

        expect(index.path.endsWith('/out/index.iife.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script type="application/javascript">
        (function() {
            function loadStyle(url) {
                var l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = url;
                document.head.appendChild(l);
            }
            loadStyle('index-UMVLUHQU.css');
        }());
    </script>
</head>

<body>
    <script src="index-JEYWDNLH.js" type="application/javascript"></script>
</body>

</html>`);

        expect(js.path.endsWith('/out/index-JEYWDNLH.js')).to.be.true;
        expect(js.text).to.be.equal(`"use strict";
(() => {
  // fixture/lib.js
  var log = console.log.bind(console);

  // fixture/index.js
  window.addEventListener("load", () => {
    log("test");
  });
})();
`);

        expect(css.path.endsWith('/out/index-UMVLUHQU.css')).to.be.true;
        expect(css.text).to.be.equal(`/* fixture/index.css */
html,
body {
  margin: 0;
  padding: 0;
}
`);
    });

    it('should bundle webapp with scripts and sourcemaps', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.iife.html', import.meta.url).pathname],
            sourceRoot: '/',
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            sourcemap: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index,, js,, css] = outputFiles;

        expect(outputFiles).to.have.lengthOf(5);

        expect(index.path.endsWith('/out/index.iife.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script type="application/javascript">
        (function() {
            function loadStyle(url) {
                var l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = url;
                document.head.appendChild(l);
            }
            loadStyle('index-CECUKMCO.css');
        }());
    </script>
</head>

<body>
    <script src="index-FIAOTJ3G.js" type="application/javascript"></script>
</body>

</html>`);

        expect(js.path.endsWith('/out/index-FIAOTJ3G.js')).to.be.true;
        expect(js.text).to.be.equal(`"use strict";
(() => {
  // fixture/lib.js
  var log = console.log.bind(console);

  // fixture/index.js
  window.addEventListener("load", () => {
    log("test");
  });
})();
//# sourceMappingURL=index-FIAOTJ3G.js.map
`);

        expect(css.path.endsWith('/out/index-CECUKMCO.css')).to.be.true;
        expect(css.text).to.be.equal(`/* fixture/index.css */
html,
body {
  margin: 0;
  padding: 0;
}
/*# sourceMappingURL=index-CECUKMCO.css.map */
`);
    });

    it('should bundle webapp with modules', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.esm.html', import.meta.url).pathname],
            sourceRoot: '/',
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...files] = outputFiles;
        const jsFile = files.find((file) => file.path.includes('/out/index') && file.path.endsWith('.js'));
        const jsSource = files.find((file) => file.path.includes('/out/1-') && file.path.endsWith('.js'));
        const jsChunk = files.find((file) => file.path.includes('/out/chunk-') && file.path.endsWith('.js'));
        const css = files.find((file) => file.path.endsWith('.css'));

        expect(outputFiles).to.have.lengthOf(5);

        expect(index.path.endsWith('/out/index.esm.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script type="module">
        (function() {
            function loadStyle(url) {
                var l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = url;
                document.head.appendChild(l);
            }
            loadStyle('index-UMVLUHQU.css');
        }());
    </script>
</head>

<body>
    <script src="index-7DQE4SCR.js" type="module"></script>
    <script type="module">
        import './1-ZOQZ7JHL.js'
    </script>
</body>

</html>`);

        expect(jsFile.path.endsWith('index-7DQE4SCR.js')).to.be.true;
        expect(jsFile.text).to.be.equal(`import {
  log
} from "./chunk-VLQWHBZB.js";

// fixture/index.js
window.addEventListener("load", () => {
  log("test");
});
`);

        expect(jsSource.path.endsWith('/1-ZOQZ7JHL.js')).to.be.true;
        expect(jsSource.text).to.be.equal(`import {
  log
} from "./chunk-VLQWHBZB.js";

// fixture/1.js
log("test");
`);

        expect(jsChunk.path.endsWith('/chunk-VLQWHBZB.js')).to.be.true;
        expect(jsChunk.text).to.be.equal(`// fixture/lib.js
var log = console.log.bind(console);

export {
  log
};
`);

        expect(css.path.endsWith('/index-UMVLUHQU.css')).to.be.true;
        expect(css.text).to.be.equal(`/* fixture/index.css */
html,
body {
  margin: 0;
  padding: 0;
}
`);
    });

    it('should bundle webapp with modules and chunks', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.chunks.html', import.meta.url).pathname],
            sourceRoot: '/',
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            splitting: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...files] = outputFiles;
        const jsFile = files.find((file) => file.path.includes('/out/index') && file.path.endsWith('.js'));
        const jsSource = files.find((file) => file.path.includes('/out/1-') && file.path.endsWith('.js'));
        const jsLib = files.find((file) => file.path.includes('/out/lib-') && file.path.endsWith('.js'));
        const jsChunk = files.find((file) => file.path.includes('/out/chunk-') && file.path.endsWith('.js'));
        const css = files.find((file) => file.path.endsWith('.css'));

        expect(outputFiles).to.have.lengthOf(6);

        expect(index.path.endsWith('/out/index.chunks.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script type="module">
        (function() {
            function loadStyle(url) {
                var l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = url;
                document.head.appendChild(l);
            }
            loadStyle('index-UMVLUHQU.css');
        }());
    </script>
</head>

<body>
    <script type="module">
        import './1-GWHRC5DW.js'
    </script>
    <script src="index-NISLXZJK.js" type="module"></script>
</body>

</html>`);

        expect(jsFile.path.endsWith('/index-NISLXZJK.js')).to.be.true;
        expect(jsFile.text).to.be.equal(`import {
  log
} from "./chunk-GNFD7QL2.js";

// fixture/index.js
window.addEventListener("load", () => {
  log("test");
});
`);

        expect(jsSource.path.endsWith('/1-GWHRC5DW.js')).to.be.true;
        expect(jsSource.text).to.be.equal(`// fixture/1.js
import("./lib-476DRX7L.js").then(({ log }) => {
  log("test");
});
`);

        expect(jsLib.path.endsWith('/lib-476DRX7L.js')).to.be.true;
        expect(jsLib.text).to.be.equal(`import {
  log
} from "./chunk-GNFD7QL2.js";
export {
  log
};
`);

        expect(jsChunk.path.endsWith('/chunk-GNFD7QL2.js')).to.be.true;
        expect(jsChunk.text).to.be.equal(`// fixture/lib.js
var log = console.log.bind(console);

export {
  log
};
`);

        expect(css.path.endsWith('/index-UMVLUHQU.css')).to.be.true;
        expect(css.text).to.be.equal(`/* fixture/index.css */
html,
body {
  margin: 0;
  padding: 0;
}
`);
    });

    it('should bundle webapp with modules and scripts', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.mixed.html', import.meta.url).pathname],
            sourceRoot: '/',
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const index = /** @type {import('esbuild').OutputFile} */ (outputFiles.find((file) => file.path.endsWith('.html')));
        const iife = /** @type {import('esbuild').OutputFile} */ (outputFiles.find((file) => file.path.endsWith('index-JEYWDNLH.js')));
        const esm = /** @type {import('esbuild').OutputFile} */ (outputFiles.find((file) => file.path.endsWith('index-6PRLBFYO.js')));
        const css = /** @type {import('esbuild').OutputFile} */ (outputFiles.find((file) => file.path.endsWith('index-UMVLUHQU.css')));

        expect(outputFiles).to.have.lengthOf(5);

        expect(index.path.endsWith('/out/index.mixed.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script type="module">
        (function() {
            function loadStyle(url) {
                var l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = url;
                document.head.appendChild(l);
            }
            loadStyle('index-UMVLUHQU.css');
        }());
    </script>
    <script nomodule="" type="application/javascript">
        (function() {
            function loadStyle(url) {
                var l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = url;
                document.head.appendChild(l);
            }
            loadStyle('index-UMVLUHQU.css');
        }());
    </script>
</head>

<body>
    <script src="index-6PRLBFYO.js" type="module"></script>
    <script src="index-JEYWDNLH.js" type="application/javascript" nomodule=""></script>
</body>

</html>`);

        expect(iife.path.endsWith('/out/index-JEYWDNLH.js')).to.be.true;
        expect(iife.text).to.be.equal(`"use strict";
(() => {
  // fixture/lib.js
  var log = console.log.bind(console);

  // fixture/index.js
  window.addEventListener("load", () => {
    log("test");
  });
})();
`);

        expect(esm.path.endsWith('/out/index-6PRLBFYO.js')).to.be.true;
        expect(esm.text).to.be.equal(`// fixture/lib.js
var log = console.log.bind(console);

// fixture/index.js
window.addEventListener("load", () => {
  log("test");
});
`);

        expect(css.path.endsWith('/out/index-UMVLUHQU.css')).to.be.true;
        expect(css.text).to.be.equal(`/* fixture/index.css */
html,
body {
  margin: 0;
  padding: 0;
}
`);
    });

    it('should bundle webapp with styles', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.css.html', import.meta.url).pathname],
            sourceRoot: '/',
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...cssFiles] = outputFiles;
        const cssFile = cssFiles.find((output) => output.path.includes('/out/index'));
        const cssSource = cssFiles.find((output) => output.path.includes('/out/1-'));

        expect(outputFiles).to.have.lengthOf(3);

        expect(index.path.endsWith('/out/index.css.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="index-UMVLUHQU.css">
    <style>
        @import '1-EKADEBHI.css'
    </style>
</head>

<body>
</body>

</html>`);

        expect(cssFile.path.endsWith('/out/index-UMVLUHQU.css')).to.be.true;
        expect(cssFile.text).to.be.equal(`/* fixture/index.css */
html,
body {
  margin: 0;
  padding: 0;
}
`);

        expect(cssSource.path.endsWith('/out/1-EKADEBHI.css')).to.be.true;
        expect(cssSource.text).to.be.equal(`/* fixture/1.css */
body {
  color: red;
}
`);
    });

    it('should bundle webapp with virtual styles', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('./index.html', import.meta.url).pathname],
            sourceRoot: new URL('.', import.meta.url).pathname,
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            bundle: true,
            write: false,
            plugins: [
                virtualPlugin([
                    {
                        path: new URL('./index.html', import.meta.url).pathname,
                        contents: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="index.css">
</head>
<body>

</body>
</html>
`,
                    },
                    {
                        path: 'index.css',
                        contents: '@import \'lib.css\';',
                        loader: 'css',
                    },
                    {
                        path: 'lib.css',
                        contents: 'html { padding: 0; }',
                        loader: 'css',
                    },
                ]),
                htmlPlugin(),
            ],
        });

        const [index, css] = outputFiles;

        expect(outputFiles).to.have.lengthOf(2);

        expect(index.path.endsWith('/out/index.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="index-JHCCFNW4.css">
</head>

<body>
</body>

</html>`);

        expect(css.path.endsWith('/out/index-JHCCFNW4.css')).to.be.true;
        expect(css.text).to.be.equal(`/* lib.css */
html {
  padding: 0;
}

/* index.css */
`);
    });

    it('should bundle webapp with png favicons', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.icons.html', import.meta.url).pathname],
            sourceRoot: '/',
            assetNames: 'icons/[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...icons] = outputFiles;

        expect(outputFiles).to.have.lengthOf(7);

        expect(index.path.endsWith('/out/index.icons.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="icon" sizes="16x16" href="icons/favicon-16x16.png">
    <link rel="icon" sizes="32x32" href="icons/favicon-32x32.png">
    <link rel="icon" sizes="48x48" href="icons/favicon-48x48.png">
    <link rel="shortcut icon" href="icons/favicon-196x196.png">
    <link rel="icon" sizes="196x196" href="icons/favicon-196x196.png">
    <link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="167x167" href="icons/apple-touch-icon-ipad.png">
</head>

<body>
</body>

</html>`);

        expect(icons[0].path.endsWith('/out/icons/favicon-16x16.png')).to.be.true;
        expect(icons[0].contents.byteLength).to.be.equal(459);

        expect(icons[3].path.endsWith('/out/icons/favicon-196x196.png')).to.be.true;
        expect(icons[3].contents.byteLength).to.be.equal(6366);
    });

    it('should bundle webapp with svg favicon', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.svgicons.html', import.meta.url).pathname],
            sourceRoot: '/',
            assetNames: 'icons/[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, icon] = outputFiles;

        expect(outputFiles).to.have.lengthOf(2);

        expect(index.path.endsWith('/out/index.svgicons.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="shortcut icon" href="icons/icon.svg" type="image/svg+xml">
</head>

<body>
</body>

</html>`);

        expect(icon.path.endsWith('/out/icons/icon.svg')).to.be.true;
        expect(icon.contents.byteLength).to.be.equal(1475);
    });

    it('should bundle webapp with ios splashscreens', async function() {
        this.timeout(15000);

        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.screens.html', import.meta.url).pathname],
            sourceRoot: '/',
            assetNames: 'screens/[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...screens] = outputFiles;

        expect(outputFiles).to.have.lengthOf(8);

        expect(index.path.endsWith('/out/index.screens.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="screens/apple-launch-iphonex.png">
    <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="screens/apple-launch-iphone8.png">
    <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="screens/apple-launch-iphone8-plus.png">
    <link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="screens/apple-launch-iphone5.png">
    <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" href="screens/apple-launch-ipadair.png">
    <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" href="screens/apple-launch-ipadpro10.png">
    <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" href="screens/apple-launch-ipadpro12.png">
</head>

<body>
</body>

</html>`);

        expect(screens[0].path.endsWith('/out/screens/apple-launch-iphonex.png')).to.be.true;
        expect(screens[0].contents.byteLength).to.be.equal(21254);

        expect(screens[3].path.endsWith('/out/screens/apple-launch-iphone5.png')).to.be.true;
        expect(screens[3].contents.byteLength).to.be.equal(8536);
    });

    it('should bundle webapp with assets', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.assets.html', import.meta.url).pathname],
            sourceRoot: '/',
            assetNames: 'assets/[dir]/[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...assets] = outputFiles;

        expect(outputFiles).to.have.lengthOf(3);

        expect(index.path.endsWith('/out/index.assets.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="preload" href="assets/icon.svg">
</head>

<body>
    <img src="assets/img/icon.png" alt="">
</body>

</html>`);

        assets.sort((a1, a2) => a2.contents.byteLength - a1.contents.byteLength);

        expect(assets[0].path.endsWith('/out/assets/img/icon.png')).to.be.true;
        expect(assets[0].contents.byteLength).to.be.equal(20754);

        expect(assets[1].path.endsWith('/out/assets/icon.svg')).to.be.true;
        expect(assets[1].contents.byteLength).to.be.equal(1475);
    });

    it('should bundle webapp with a webmanifest', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.manifest.html', import.meta.url).pathname],
            sourceRoot: '/',
            assetNames: 'assets/[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...assets] = outputFiles;
        const icons = assets.slice(0, 9);
        const manifest = assets[9];

        expect(outputFiles).to.have.lengthOf(17);

        expect(index.path.endsWith('/out/index.manifest.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Test">
    <title>Document</title>
    <link rel="icon" sizes="16x16" href="assets/favicon-16x16.png">
    <link rel="icon" sizes="32x32" href="assets/favicon-32x32.png">
    <link rel="icon" sizes="48x48" href="assets/favicon-48x48.png">
    <link rel="shortcut icon" href="assets/favicon-196x196.png">
    <link rel="icon" sizes="196x196" href="assets/favicon-196x196.png">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="167x167" href="assets/apple-touch-icon-ipad.png">
    <link rel="manifest" href="assets/manifest.webmanifest">
</head>

<body>
</body>

</html>`);

        expect(icons).to.have.lengthOf(9);
        expect(icons[0].path.endsWith('/out/assets/android-chrome-36x36.png')).to.be.true;
        expect(icons[0].contents.byteLength).to.be.equal(1135);
        expect(icons[8].path.endsWith('/out/assets/android-chrome-512x512.png')).to.be.true;
        expect(icons[8].contents.byteLength).to.be.equal(24012);

        expect(manifest.path.endsWith('/out/assets/manifest.webmanifest')).to.be.true;
        expect(manifest.text).to.be.equal(`{
  "name": "Document",
  "short_name": "Document",
  "description": "Test",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#fff",
  "lang": "en",
  "icons": [
    {
      "src": "android-chrome-36x36.png",
      "sizes": "36x36",
      "type": "image/png"
    },
    {
      "src": "android-chrome-48x48.png",
      "sizes": "48x48",
      "type": "image/png"
    },
    {
      "src": "android-chrome-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "android-chrome-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "android-chrome-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "android-chrome-256x256.png",
      "sizes": "256x256",
      "type": "image/png"
    },
    {
      "src": "android-chrome-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}`);
    });

    it('should bundle webapp with [dir] and outbase', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.iife.html', import.meta.url).pathname],
            sourceRoot: '/',
            outbase: new URL('./', import.meta.url).pathname,
            entryNames: '[dir]/[name]',
            chunkNames: '[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...files] = outputFiles;
        const js = files.find((file) => file.path.endsWith('.js'));
        const css = files.find((file) => file.path.endsWith('.css'));

        expect(outputFiles).to.have.lengthOf(3);
        expect(index.path.endsWith('/out/fixture/index.iife.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script type="application/javascript">
        (function() {
            function loadStyle(url) {
                var l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = url;
                document.head.appendChild(l);
            }
            loadStyle('../index.css');
        }());
    </script>
</head>

<body>
    <script src="../index.js" type="application/javascript"></script>
</body>

</html>`);

        expect(js.path.endsWith('/out/index.js')).to.be.true;
        expect(css.path.endsWith('/out/index.css')).to.be.true;
    });

    it('should bundle webapp with [dir] without outbase', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.iife.html', import.meta.url).pathname],
            sourceRoot: '/',
            entryNames: '[dir]/[name]',
            chunkNames: '[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...files] = outputFiles;
        const js = files.find((file) => file.path.endsWith('.js'));
        const css = files.find((file) => file.path.endsWith('.css'));

        expect(outputFiles).to.have.lengthOf(3);
        expect(index.path.endsWith('/out/index.iife.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script type="application/javascript">
        (function() {
            function loadStyle(url) {
                var l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = url;
                document.head.appendChild(l);
            }
            loadStyle('index.css');
        }());
    </script>
</head>

<body>
    <script src="index.js" type="application/javascript"></script>
</body>

</html>`);

        expect(js.path.endsWith('/out/index.js')).to.be.true;
        expect(css.path.endsWith('/out/index.css')).to.be.true;
    });
});
