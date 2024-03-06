/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^.+\\.svg\\?react$|@powsybl/diagram-viewer': 'jest-svg-transformer',
        '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
    },
    transformIgnorePatterns: ['node_modules/(?!@gridsuite/commons-ui)'], // transform from ESM
    moduleDirectories: ['node_modules', 'src'], // to allow absolute path from ./src
    setupFiles: ['<rootDir>/jest.setup.ts'],
};

export default config;
