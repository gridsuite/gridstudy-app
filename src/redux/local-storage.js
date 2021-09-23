/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DARK_THEME, LANG_SYSTEM } from '@gridsuite/commons-ui';
import { getComputedLanguage } from '../utils/language';
import { APP_NAME } from '../utils/config-params';

const LOCAL_STORAGE_THEME_KEY = (APP_NAME + '_THEME').toUpperCase();
const LOCAL_STORAGE_LANGUAGE_KEY = (APP_NAME + '_LANGUAGE').toUpperCase();

export const getLocalStorageTheme = () => {
    return localStorage.getItem(LOCAL_STORAGE_THEME_KEY) || DARK_THEME;
};

export const saveLocalStorageTheme = (theme) => {
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
};

export const getLocalStorageLanguage = () => {
    return localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY) || LANG_SYSTEM;
};

export const saveLocalStorageLanguage = (language) => {
    localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, language);
};

export const getLocalStorageComputedLanguage = () => {
    return getComputedLanguage(getLocalStorageLanguage());
};
