/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DARK_THEME, getComputedLanguage, GsLang, GsTheme, LANG_SYSTEM } from '@gridsuite/commons-ui';
import { APP_NAME, LOCAL_STORAGE_KEY_PREFIX } from '../../utils/config-params';
import type { UUID } from 'node:crypto';

const STUDY_LAST_ACCESSED_KEY = `${LOCAL_STORAGE_KEY_PREFIX}:last-accessed`;
const STUDY_TTL_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
// FIXME: remove on next release, old navigation keys to be cleaned up
const LEGACY_NAVIGATION_PREFIXES = ['SYNC_ENABLED-', 'ROOT_NETWORK_UUID-', 'TREE_NODE_UUID-'];

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

export function saveStudyAccessTimestamp(studyUuid: UUID): void {
    try {
        localStorage.setItem(`${STUDY_LAST_ACCESSED_KEY}:${studyUuid}`, String(Date.now()));
    } catch (err) {
        console.warn('Failed to save study access timestamp:', err);
    }
}

export function cleanupStaleStudyData(ttlDays: number = STUDY_TTL_DAYS): void {
    try {
        const expiry = Date.now() - ttlDays * MS_PER_DAY;
        const lastAccessedPrefix = `${STUDY_LAST_ACCESSED_KEY}:`;
        // Identify study-related keys : containing the app name and a UUID, which should correspond to study-scoped entries.
        const studyKeys = Object.keys(localStorage).filter(
            (key) => key.toLowerCase().includes(APP_NAME) && UUID_REGEX.test(key)
        );

        // UUIDs with a recent last-accessed entry, everything else (stale or orphaned) will be removed
        const freshUuids = studyKeys
            .filter((key) => key.startsWith(lastAccessedPrefix))
            .map((key) => key.slice(lastAccessedPrefix.length))
            .filter((uuid) => Number(localStorage.getItem(`${lastAccessedPrefix}${uuid}`)) >= expiry);

        studyKeys
            .filter((key) => !freshUuids.some((uuid) => key.includes(uuid)))
            .forEach((key) => localStorage.removeItem(key));

        // FIXME: remove on next release, cleaning old navigation keys
        Object.keys(localStorage)
            .filter((key) => LEGACY_NAVIGATION_PREFIXES.some((prefix) => key.startsWith(prefix)))
            .forEach((key) => localStorage.removeItem(key));
    } catch (err) {
        console.warn('Failed to clean up stale study data:', err);
    }
}
