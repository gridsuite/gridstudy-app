/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Config } from 'prettier';

export default {
    trailingComma: 'es5',
    tabWidth: 4,
    printWidth: 120,
    singleQuote: true,
    keySeparator: '=', // format of separator in .properties
    plugins: ['prettier-plugin-properties'],
    overrides: [
        {
            files: ['.env', '.env.*'],
            options: { parser: 'dot-properties' },
        },
        {
            files: ['.github/**/*'],
            options: { tabWidth: 2 },
        },
    ],
} satisfies Config;
