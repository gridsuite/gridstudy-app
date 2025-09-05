/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DARK_THEME, getComputedLanguage, GsLang, GsTheme, LANG_SYSTEM } from '@gridsuite/commons-ui';
import { APP_NAME } from '../../utils/config-params';
import { StudyDisplayMode } from 'components/network-modification.type';
import { UUID } from 'crypto';
import { BASE_NAVIGATION_KEYS } from 'constants/study-navigation-sync-constants';

const LOCAL_STORAGE_THEME_KEY = (APP_NAME + '_THEME').toUpperCase();
const LOCAL_STORAGE_LANGUAGE_KEY = (APP_NAME + '_LANGUAGE').toUpperCase();

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

function getToggleOptionsKey(studyUuid: string) {
    return (APP_NAME + '_TOGGLE_OPTIONS_' + studyUuid).toUpperCase();
}

export function getLocalStorageToggleOptions(studyUuid: string): StudyDisplayMode[] {
    const saved = localStorage.getItem(getToggleOptionsKey(studyUuid));
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            // fallback to default if parsing fails
        }
    }
    return [StudyDisplayMode.TREE];
}

export function saveLocalStorageToggleOptions(studyUuid: UUID, toggleOptions: StudyDisplayMode[]) {
    localStorage.setItem(getToggleOptionsKey(studyUuid), JSON.stringify(toggleOptions));
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
