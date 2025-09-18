/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { defineConfig, loadEnv, mergeConfig } from 'vite';
import defaultConfig from './vite.config.ts';
import react from '@vitejs/plugin-react';
// @ts-expect-error See https://github.com/gxmari007/vite-plugin-eslint/issues/79
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as path from 'node:path';

export default defineConfig((configEnv) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the
    // `VITE_` prefix.
    const env = loadEnv(configEnv.mode, process.cwd(), '');
    const baseConfig = defaultConfig(configEnv);
    baseConfig.plugins = []; // remove existing plugins
    return mergeConfig(baseConfig, {
        plugins: [
            react(),
            eslint({
                failOnWarning: true,
                lintOnStart: false,
            }),
            svgr(), // works on every import with the pattern "**/*.svg?react"
            tsconfigPaths(), // to resolve absolute path via tsconfig cf https://stackoverflow.com/a/68250175/5092999
        ],
        resolve: {
            alias: {
                // Use source files from the workspace package during demo dev for HMR
                '@powsybl/network-map-layers': path.resolve(env.POWSYBL_NETWORK_VIEWER_PATH, 'packages/network-map-layers/src'),
                // Also allow importing the library src directly from the demo if needed
                '@powsybl/network-viewer': path.resolve(env.POWSYBL_NETWORK_VIEWER_PATH, 'src'),
            },
            // Ensure symlinks from the outside dependency don't confuse module resolution
            preserveSymlinks: true,
        },
        optimizeDeps: {
            // Do not prebundle the outside dependency package; we want it treated as source for HMR
            exclude: ['@powsybl/network-map-layers', '@powsybl/network-viewer'],
        },
    });
});
