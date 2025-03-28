/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import react from '@vitejs/plugin-react';
import { CommonServerOptions, defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as path from 'node:path';

const serverSettings: CommonServerOptions = {
    port: 3004,
    proxy: {
        '/api/gateway': {
            target: 'http://localhost:9000',
            rewrite: (path: string) => path.replace(/^\/api\/gateway/, ''),
        },
        '/ws/gateway': {
            target: 'http://localhost:9000',
            rewrite: (path: string) => path.replace(/^\/ws\/gateway/, ''),
            ws: true,
        },
    },
};

export default defineConfig((config) => ({
    plugins: [
        react(),
        svgr(), // works on every import with the pattern "**/*.svg?react"
        tsconfigPaths(), // to resolve absolute path via tsconfig cf https://stackoverflow.com/a/68250175/5092999
    ],
    resolve: {
        alias: {
            '@gridsuite/commons-ui': path.resolve(__dirname, '../../libs/commons-ui/src'), // 🔥 On pointe vers le source, pas dist/
            '@powsybl/network-viewer': path.resolve(__dirname, '../../libs/powsybl-diagram-viewer/src'), // 🔥 On pointe vers le source, pas dist/
        },
    },
    base: './',
    server: serverSettings, // for npm run start
    preview: serverSettings, // for npm run serve (use local build)
    build: {
        outDir: 'build',
    },
}));
