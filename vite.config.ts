/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/// <reference types="./vite-plugin-checker.d.ts" />

import react from '@vitejs/plugin-react';
import { CommonServerOptions, defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const eslintCmd = 'eslint --report-unused-disable-directives --report-unused-inline-configs warn';

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
        !config.isPreview &&
            checker({
                overlay: { initialIsOpen: 'error', position: 'bl' },
                typescript: true,
                eslint: {
                    lintCommand:
                        config.command === 'build'
                            ? `${eslintCmd} .`
                            : process.env.VITEST
                              ? `${eslintCmd} "./src/**/*.{spec,test}.{js,jsx,ts,tsx}"`
                              : `${eslintCmd} --ignore-pattern "**/*.{test,spec}.*" "./src/**/*.{js,jsx,ts,tsx}"`,
                    useFlatConfig: true,
                    dev: {
                        logLevel: ['error'], // no warning in dev mode
                    },
                },
            }),
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
}));
