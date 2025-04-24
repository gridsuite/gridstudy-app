/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { braceExpand } from 'minimatch';
import { defineConfig, globalIgnores } from 'eslint/config';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tsEslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import pluginImport from 'eslint-plugin-import';
import pluginJest from 'eslint-plugin-jest';
import pluginTestingLibrary from 'eslint-plugin-testing-library';
import { getSupportInfo, resolveConfig, resolveConfigFile } from 'prettier';

/**
 * @typedef {import('eslint').Linter.ParserOptions} EsParserOptions
 * @typedef {import('@typescript-eslint/parser').ParserOptions} TsParserOptions
 * @typedef {import('type-fest').MergeDeep<EsParserOptions, TsParserOptions>} AllParserOptions
 */

// Helper to translate old ESLintRC-style to new flat-style config
const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

const JsFiles = [`**/*.{${braceExpand('{,c,m}js{,x}').join(',')}}`];
const TsFiles = [`**/*.{${braceExpand('{,m}ts{,x}').join(',')}}`];
// const JsTsFiles = [`**/*.{${['cjs', 'cjsx', ...braceExpand('{,m}{j,t}s{,x}')].join(',')}}`];
const JsTsFiles = [...JsFiles, ...TsFiles];
const TestFiles = ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'];

function setRuleLevel(rules, rule, level) {
    if (Array.isArray(rules[rule])) {
        rules[rule][0] = level;
    } else {
        rules[rule] = level;
    }
    return rules; // just a helper for functional chaining
}

/**
 * Files checked by Prettier
 */
async function getPrettierCheckedExt() {
    const configPath = await resolveConfigFile(import.meta.filename);
    const config = await resolveConfig(configPath, { useCache: false });
    const supportInfo = await getSupportInfo({ plugins: config.plugins });
    return supportInfo.languages
        .flatMap((lng) => lng.extensions ?? []) // extract extensions checked by plugins
        .concat('.env') // also checked by prettier in override section
        .map((dotExt) => dotExt.substring(1)); // remove dot from ext string
}

export default defineConfig([
    globalIgnores([
        // .git & node_modules is implicitly always ignored
        'build/**',
        'coverage/**',
    ]),
    {
        // We set "default files" checked when another config object don't define "files" field
        name: 'ProjectCheckedFiles',
        files: [
            `**/*.{${[getPrettierCheckedExt(), JsTsFiles]
                .flat()
                .filter((ext, index, self) => self.indexOf(ext) === index) // dedupe
                .join(',')}}`,
        ],
    },
    { name: 'eslint base declare', files: JsTsFiles, plugins: { js }, extends: ['js/recommended'] },
    {
        name: 'eslint ts error reporting', // need typescript-eslint to work correctly
        files: TsFiles,
        rules: {
            'no-unused-vars': 'off',
            'no-redeclare': 'off',
            'no-undef': 'off',
            'no-case-declarations': 'off',
            'no-extra-boolean-cast': 'off',
        },
    },
    { files: TsFiles, ...tsEslint.configs.base },
    { name: 'eslint-plugin-react declare', files: JsTsFiles, plugins: { react: pluginReact } },
    { name: 'eslint-plugin-react-hooks declare', files: JsTsFiles, plugins: { 'react-hooks': pluginReactHooks } },
    { files: JsTsFiles, ...pluginReactRefresh.configs.vite },
    {
        name: 'eslint-plugin-testing-library/react',
        files: TestFiles,
        ...pluginTestingLibrary.configs['flat/react'],
        rules: {}, // rules are set by cra-config
    },
    {
        name: 'eslint-plugin-jest/recommended',
        files: TestFiles,
        ...pluginJest.configs['flat/recommended'],
        rules: {}, // rules are set by cra-config
    },
    {
        name: 'eslint-plugin-import/typescript rules',
        files: TsFiles,
        rules: pluginImport.flatConfigs.typescript.rules,
    },
    // eslint-plugin-jsx-a11y is re-declared in airbnb config and eslint don't let redeclaration of plugins
    // requires eslint, eslint-plugin-import, eslint-plugin-react, eslint-plugin-react-hooks, and eslint-plugin-jsx-a11y
    // TODO migrate when eslint v9 & flat-config supported: https://github.com/airbnb/javascript/issues/2961
    /*{
        files: JsTsFiles,
        name: 'CRA',
        // extends: compat.extends('react-app'),
        // eslint-config-react-app use internally eslint-patch that not work with eslint9
        extends: compat.extends('./eslint.config.react-app.cjs'),
    },*/
    {
        name: 'CRA tests',
        files: TestFiles,
        extends: compat.extends('./eslint.config.react-app-test.cjs'),
    },
    {
        // merge react & ts config, configure eslint-import-resolver-typescript, and finally keep airbnb-typescript override
        name: 'eslint-plugin-import config with TS support compliant with AirBnB configs',
        files: JsTsFiles,
        plugins: { import: pluginImport },
        ...pluginImport.flatConfigs.react, // do languageOptions jsx
        settings: {
            ...pluginImport.flatConfigs.typescript.settings,
            'import/parsers': {
                '@typescript-eslint/parser': [
                    ...pluginImport.flatConfigs.typescript.settings['import/parsers']['@typescript-eslint/parser'],
                    '.d.ts',
                ],
            },
            'import/resolver': {
                node: {
                    extensions: [
                        ...pluginImport.flatConfigs.typescript.settings['import/resolver'].node.extensions,
                        '.json',
                        '.d.ts',
                    ],
                },
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript:
                    /** @type {import('eslint-import-resolver-typescript').TypeScriptResolverOptions} */
                    ({
                        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
                        project: `${import.meta.dirname}/tsconfig.json`,
                    }),
            },
            'import/extensions': [...pluginImport.flatConfigs.typescript.settings['import/extensions'], '.d.ts'],
        },
        // need all these for parsing dependencies (even if _your_ code doesn't need all of them)
        languageOptions: { parser: tsEslint.parser, ecmaVersion: 'latest', sourceType: 'module' },
        rules: { 'import/no-unresolved': 'error' }, // not all files are in typescript yet
    },

    {
        name: 'General configuration',
        files: JsTsFiles,
        settings: {
            babel: true,
            // compat: true,
        },
        languageOptions: {
            globals: {
                ...globals.es2020, // https://vite.dev/guide/build.html#browser-compatibility & https://vite.dev/config/build-options.html#build-target
                ...globals.browser,
            },
            ecmaVersion: 2020,
            sourceType: 'script',
        },
        rules: {
            curly: 'error',

            // preparation move to airbnb profile
            'import/no-cycle': [
                'error',
                {
                    maxDepth: '∞',
                    ignoreExternal: true,
                },
            ],
            'import/no-self-import': 'error',
        },
    },
    {
        name: 'General configuration for tests',
        files: ['**/jest.setup.ts', '**/*.{test,spec}.{js,jsx,ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.jest, // globals.vitest
            },
        },
    },
    {
        name: 'React: jsx-runtime',
        files: JsTsFiles,
        // concretely disable react/react-in-jsx-scope & react/jsx-uses-react
        ...pluginReact.configs.flat['jsx-runtime'], // using React 17+
    },
    {
        name: 'ProjectToolsConfigs',
        files: ['**/*.config.{js,ts}', '**/eslint.config.*.js'],
        languageOptions: { globals: globals.node, ecmaVersion: 'latest', sourceType: 'module' },
    },
    // keep last in case we have reactivated a rule that conflict with Prettier (turn off the rules of some core & eslint plugins rules)
    {
        ...eslintPluginPrettierRecommended, // include eslint-config-prettier
        // format isn't mandatory during dev session, so we pass it to warn level instead of error
        rules: setRuleLevel({ ...eslintPluginPrettierRecommended.rules }, 'prettier/prettier', 'warn'),
    },
]);
