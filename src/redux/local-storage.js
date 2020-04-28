/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {DARK_THEME} from "./actions";

const LOCAL_STORAGE_THEME_KEY = "STUDY_APP_THEME";

export const getLocalStorageTheme = () => {
    return localStorage.getItem(LOCAL_STORAGE_THEME_KEY) || DARK_THEME;
};

export const saveLocalStorageTheme = (theme) => {
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
};

const LOCAL_STORAGE_USE_NAME_KEY = "STUDY_APP_USE_NAME";

export const getLocalStorageUseName = () => {
    const value = localStorage.getItem(LOCAL_STORAGE_USE_NAME_KEY);
    return value === "true";
};

export const saveLocalStorageUseName = (useName) => {
    localStorage.setItem(LOCAL_STORAGE_USE_NAME_KEY, useName);
};

const LOCAL_STORAGE_CENTER_LABEL_KEY = "STUDY_APP_CENTER_LABEL";

export const getLocalStorageCenterLabel = () => {
    const value = localStorage.getItem(LOCAL_STORAGE_CENTER_LABEL_KEY);
    return value === "true";
};

export const saveLocalStorageCenterLabel = (useName) => {
    localStorage.setItem(LOCAL_STORAGE_CENTER_LABEL_KEY, useName);
};

const LOCAL_STORAGE_DIAGONAL_LABEL_KEY = "STUDY_APP_DIAGONAL_LABEL";

export const getLocalStorageDiagonalLabel = () => {
    const value = localStorage.getItem(LOCAL_STORAGE_DIAGONAL_LABEL_KEY);
    return value === "true";
};

export const saveLocalStorageDiagonalLabel = (useName) => {
    localStorage.setItem(LOCAL_STORAGE_DIAGONAL_LABEL_KEY, useName);
};

const LOCAL_STORAGE_TOPOLOGICAL_COLORING_KEY = "STUDY_APP_TOPOLOGICAL_COLORING";

export const getLocalStorageTopologicalColoring = () => {
    const value = localStorage.getItem(LOCAL_STORAGE_TOPOLOGICAL_COLORING_KEY);
    return value === "true";
};

export const saveLocalStorageTopologicalColoring = (topologicalColoring) => {
    localStorage.setItem(LOCAL_STORAGE_TOPOLOGICAL_COLORING_KEY, topologicalColoring);
};
