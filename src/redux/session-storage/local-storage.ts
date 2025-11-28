/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BaseVoltage, DARK_THEME, getComputedLanguage, GsLang, GsTheme, LANG_SYSTEM } from '@gridsuite/commons-ui';
import { APP_NAME } from '../../utils/config-params';
import type { UUID } from 'node:crypto';
import { BASE_NAVIGATION_KEYS } from 'constants/study-navigation-sync-constants';

const LOCAL_STORAGE_THEME_KEY = (APP_NAME + '_THEME').toUpperCase();
const LOCAL_STORAGE_LANGUAGE_KEY = (APP_NAME + '_LANGUAGE').toUpperCase();
const LOCAL_STORAGE_BASE_VOLTAGES_KEY = (APP_NAME + '_BASE_VOLTAGES').toUpperCase();

export function getLocalStorageTheme() {
    return (localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as GsTheme) || DARK_THEME;
}

export function saveLocalStorageTheme(theme: GsTheme) {
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
}

export function getLocalStorageLanguage() {
    return (localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY) as GsLang) || LANG_SYSTEM;
}

export function saveLocalStorageLanguage(language: GsLang) {
    localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, language);
}

export function getLocalStorageComputedLanguage() {
    return getComputedLanguage(getLocalStorageLanguage());
}

export function getLocalStorageSyncEnabled(studyUuid: UUID): boolean {
    const saved = localStorage.getItem(`${BASE_NAVIGATION_KEYS.SYNC_ENABLED}-${studyUuid}`);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            // fallback to default if parsing fails
        }
    }
    return false;
}

export function getLocalStorageBaseVoltages(): BaseVoltage[] {
    const baseVoltages = localStorage.getItem(LOCAL_STORAGE_BASE_VOLTAGES_KEY);
    if (baseVoltages) {
        return JSON.parse(baseVoltages);
    }
    return [];
}

export function saveLocalStorageBaseVoltages(baseVoltages: BaseVoltage[]) {
    localStorage.setItem(LOCAL_STORAGE_BASE_VOLTAGES_KEY, JSON.stringify(baseVoltages));
}
