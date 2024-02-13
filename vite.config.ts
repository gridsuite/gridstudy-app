import react from '@vitejs/plugin-react';
import { PluginOption, transformWithEsbuild } from 'vite';
import { defineConfig } from 'vite';
import * as path from 'path';
import { resolve } from 'path';
import eslint from 'vite-plugin-eslint';
import dts from 'vite-plugin-dts';
import * as fs from 'fs/promises';
import * as url from 'url';
import { createRequire } from 'node:module';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    server: {
        port: 3000,
        proxy: {
            '/api/gateway': {
                target: 'http://localhost:9000',
                rewrite: (path) => path.replace(/^\/api\/gateway/, ''),
            },
            '/ws/gateway': {
                target: 'http://localhost:9000',
                rewrite: (path) => path.replace(/^\/ws\/gateway/, ''),
                ws: true,
            },
        },
    },
    plugins: [
        react({
            jsxImportSource: '@emotion/react',
            babel: {
                plugins: ['@emotion/babel-plugin'],
            },
        }),
        // eslint(),
        // dts(),
        svgr({ include: '**/*.svg' }), // default is { include: "**/*.svg?react" }
        reactVirtualized(),
        tsconfigPaths() // to resolve absolute path via tsconfig cf https://stackoverflow.com/a/68250175/5092999
    ],
});

// Workaround for react-virtualized with vite
// https://github.com/bvaughn/react-virtualized/issues/1632#issuecomment-1483966063
function reactVirtualized(): PluginOption {
    const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;
    return {
        name: 'flat:react-virtualized',
        // Note: we cannot use the `transform` hook here
        //       because libraries are pre-bundled in vite directly,
        //       plugins aren't able to hack that step currently.
        //       so instead we manually edit the file in node_modules.
        //       all we need is to find the timing before pre-bundling.
        configResolved: async () => {
            const require = createRequire(import.meta.url);
            const reactVirtualizedPath = require.resolve('react-virtualized');
            const { pathname: reactVirtualizedFilePath } = new url.URL(
                reactVirtualizedPath,
                import.meta.url
            );
            const file = reactVirtualizedFilePath.replace(
                path.join('dist', 'commonjs', 'index.js'),
                path.join(
                    'dist',
                    'es',
                    'WindowScroller',
                    'utils',
                    'onScroll.js'
                )
            );
            const code = await fs.readFile(file, 'utf-8');
            const modified = code.replace(WRONG_CODE, '');
            await fs.writeFile(file, modified);
        },
    };
}
