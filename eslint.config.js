/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { configs, plugins } from 'eslint-config-airbnb-extended';
import { rules as prettierConfigRules } from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import js from '@eslint/js';

const jsConfig = [
    // ESLint Recommended Rules
    {
        name: 'js/config',
        ...js.configs.recommended,
    },
    // Stylistic Plugin
    plugins.stylistic,
    // Import X Plugin
    plugins.importX,
    // Airbnb Base Recommended Config
    ...configs.base.recommended,
];

const reactConfig = [
    // React Plugin
    plugins.react,
    // React Hooks Plugin
    plugins.reactHooks,
    // React JSX A11y Plugin
    plugins.reactA11y,
    // Airbnb React Recommended Config
    ...configs.react.recommended,
];

const typescriptConfig = [
    // TypeScript ESLint Plugin
    plugins.typescriptEslint,
    // Airbnb Base TypeScript Config
    ...configs.base.typescript,
    // Airbnb React TypeScript Config
    ...configs.react.typescript,
];

const prettierConfig = [
    // Prettier Plugin
    {
        name: 'prettier/plugin/config',
        plugins: {
            prettier: prettierPlugin,
        },
    },
    // Prettier Config (disable conflicting rules)
    {
        name: 'prettier/config',
        rules: {
            ...prettierConfigRules,
            'prettier/prettier': 'warn',
        },
    },
];

const projectConfig = [
    {
        name: 'project/ignores',
        ignores: ['dist', 'build', 'coverage'],
    },
    {
        name: 'project/settings',
        settings: {
            react: {
                version: 'detect',
            },
            // TypeScript import resolver settings
            'import-x/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import-x/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
            },
        },
    },
    // React Refresh Plugin
    {
        name: 'project/react-refresh',
        files: ['**/*.{jsx,tsx}'],
        plugins: {
            'react-refresh': reactRefreshPlugin,
        },
        rules: {
            'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
        },
    },
    // React JSX Runtime (prevents "React must be in scope" errors)
    {
        name: 'project/react-jsx-runtime',
        files: ['**/*.{jsx,tsx}'],
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
        },
    },
    // Custom rules
    {
        name: 'project/rules',
        rules: {
            // Code style
            curly: 'error',
            'no-console': 'off',
            'no-plusplus': 'off',

            // React rules
            'react/jsx-props-no-spreading': 'off',
            'react/require-default-props': 'off',

            // Import rules
            'import-x/prefer-default-export': 'off',
            'import-x/extensions': 'off',
            'import-x/no-unresolved': 'off',
            'import-x/no-useless-path-segments': 'off',
            'import-x/no-cycle': [
                'off', // TODO: Re-enable and fix circular dependencies in the codebase
                {
                    maxDepth: Infinity,
                    ignoreExternal: true,
                },
            ],
            'import-x/no-self-import': 'error',
            'import-x/no-extraneous-dependencies': [
                'off', // Disabled to allow devDependencies in all files, TO FIX later (use type-only imports for typescript types)
                {
                    devDependencies: true,
                    optionalDependencies: false,
                },
            ],

            // MUI deep imports - disabled
            'no-restricted-imports': 'off',

            // ============================================
            // Rules disabled to match old .eslintrc.json behavior
            // ============================================

            // Stylistic rules
            '@stylistic/lines-between-class-members': 'off',
            '@stylistic/spaced-comment': 'off',
            'arrow-body-style': 'off',
            'dot-notation': 'off',
            'func-names': 'off', // Disabled - was causing ~20 warnings
            'object-shorthand': 'off',
            'operator-assignment': 'off',
            'prefer-arrow-callback': 'off',
            'prefer-const': 'off',
            'prefer-destructuring': 'off',
            'prefer-exponentiation-operator': 'off',
            'prefer-template': 'off',
            radix: 'off',
            yoda: 'off',

            // Code quality rules
            camelcase: 'off',
            'class-methods-use-this': 'off',
            'consistent-return': 'off',
            'default-case': 'off',
            'no-await-in-loop': 'off',
            'no-case-declarations': 'off',
            'no-cond-assign': 'off',
            'no-continue': 'off',
            'no-else-return': 'off',
            'no-extra-boolean-cast': 'off',
            'no-lonely-if': 'off',
            'no-nested-ternary': 'off',
            'no-param-reassign': 'off',
            'no-prototype-builtins': 'off',
            'no-restricted-exports': 'off',
            'no-restricted-globals': 'off',
            'no-restricted-properties': 'off',
            'no-restricted-syntax': 'off',
            'no-return-assign': 'off',
            'no-shadow': 'off',
            'no-undef-init': 'off',
            'no-unneeded-ternary': 'off',
            'no-unsafe-optional-chaining': 'off',
            'no-unused-expressions': 'off',
            'no-unused-vars': 'off',
            'no-use-before-define': 'off',
            'no-useless-return': 'off',

            // Import rules
            'import-x/newline-after-import': 'off',
            'import-x/no-duplicates': 'off',
            'import-x/no-named-as-default': 'off',
            'import-x/order': 'off',

            // React rules
            'react/destructuring-assignment': 'off',
            'react/forbid-prop-types': 'off',
            'react/function-component-definition': 'off',
            'react/jsx-boolean-value': 'off',
            'react/jsx-curly-brace-presence': 'off',
            'react/jsx-no-bind': 'off',
            'react/jsx-no-constructed-context-values': 'off',
            'react/jsx-no-duplicate-props': 'off',
            'react/jsx-no-useless-fragment': 'off',
            'react/no-array-index-key': 'off',
            'react/no-children-prop': 'off',
            'react/no-unstable-nested-components': 'off',
            'react/no-unused-prop-types': 'off',
            'react/prop-types': 'off',
            'react/self-closing-comp': 'off',

            // TypeScript rules
            '@typescript-eslint/consistent-indexed-object-style': 'off',
            '@typescript-eslint/consistent-type-definitions': 'off',
            '@typescript-eslint/default-param-last': 'off',
            '@typescript-eslint/dot-notation': 'off',
            '@typescript-eslint/naming-convention': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-shadow': 'off',
            '@typescript-eslint/no-unnecessary-template-expression': 'off',
            '@typescript-eslint/no-unnecessary-type-arguments': 'off',
            '@typescript-eslint/no-unnecessary-type-assertion': 'off',
            '@typescript-eslint/no-unsafe-enum-comparison': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-use-before-define': 'off',
            '@typescript-eslint/no-wrapper-object-types': 'off',
            '@typescript-eslint/prefer-destructuring': 'off',
            '@typescript-eslint/prefer-function-type': 'off',
            '@typescript-eslint/return-await': 'off',
        },
    },
];

export default [...jsConfig, ...reactConfig, ...typescriptConfig, ...prettierConfig, ...projectConfig];
