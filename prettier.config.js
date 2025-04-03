/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// @ts-check
/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 * @todo Pass this file in typescript when the IDEs plugins support it<ul>
 *       <li>https://github.com/prettier/prettier-vscode/issues/3623</li>
 *       <li>https://youtrack.jetbrains.com/issue/WEB-71713/Support-for-prettier.config.ts</li></ul>
 */
const config = {
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
};
export default config;
