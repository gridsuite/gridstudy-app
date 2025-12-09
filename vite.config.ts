/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import react from '@vitejs/plugin-react';
import { CommonServerOptions, defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

const serverSettings: CommonServerOptions = {
    port: 3004,
    proxy: {
        '/api/gateway': {
            target: 'http://localhost:9000',
            rewrite: (url: string) => url.replace(/^\/api\/gateway/, ''),
        },
        '/ws/gateway': {
            target: 'http://localhost:9000',
            rewrite: (url: string) => url.replace(/^\/ws\/gateway/, ''),
            ws: true,
        },
    },
};

export default defineConfig((_config) => ({
    plugins: [
        react(),
        svgr(), // works on every import with the pattern "**/*.svg?react"
        tsconfigPaths(), // to resolve absolute path via tsconfig cf https://stackoverflow.com/a/68250175/5092999
    ],
    base: './',
    server: serverSettings, // for npm run start
    preview: serverSettings, // for npm run serve (use local build)
    build: {
        outDir: 'build',
    },
    resolve: {
        alias: {
            '@gridsuite/commons-ui': path.resolve(__dirname, '../commons-ui/src'),
        },
    },
}));
