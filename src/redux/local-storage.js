/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {DARK_THEME, LineFlowMode} from "./actions";

const LOCAL_STORAGE_THEME_KEY = "STUDY_APP_THEME";

export const getLocalStorageTheme = () => {
    return localStorage.getItem(LOCAL_STORAGE_THEME_KEY) || DARK_THEME;
};

export const saveLocalStorageTheme = (theme) => {
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
};

const LOCAL_STORAGE_USE_NAME_KEY = "STUDY_APP_USE_NAME";

export const getLocalStorageBoolean = (key) => {
    const value = localStorage.getItem(key);
    return value === "true";
};

export const getLocalStorageUseName = () => getLocalStorageBoolean(LOCAL_STORAGE_USE_NAME_KEY);

export const saveLocalStorageUseName = (useName) => {
    localStorage.setItem(LOCAL_STORAGE_USE_NAME_KEY, useName);
};

const LOCAL_STORAGE_CENTER_LABEL_KEY = "STUDY_APP_CENTER_LABEL";

export const getLocalStorageCenterLabel = () => getLocalStorageBoolean(LOCAL_STORAGE_CENTER_LABEL_KEY);

export const saveLocalStorageCenterLabel = (useName) => {
    localStorage.setItem(LOCAL_STORAGE_CENTER_LABEL_KEY, useName);
};

const LOCAL_STORAGE_DIAGONAL_LABEL_KEY = "STUDY_APP_DIAGONAL_LABEL";

export const getLocalStorageDiagonalLabel = () => getLocalStorageBoolean(LOCAL_STORAGE_DIAGONAL_LABEL_KEY);

export const saveLocalStorageDiagonalLabel = (useName) => {
    localStorage.setItem(LOCAL_STORAGE_DIAGONAL_LABEL_KEY, useName);
};

const LOCAL_STORAGE_TOPOLOGICAL_COLORING_KEY = "STUDY_APP_TOPOLOGICAL_COLORING";

export const getLocalStorageTopologicalColoring = () => getLocalStorageBoolean(LOCAL_STORAGE_TOPOLOGICAL_COLORING_KEY);

export const saveLocalStorageTopologicalColoring = (topologicalColoring) => {
    localStorage.setItem(LOCAL_STORAGE_TOPOLOGICAL_COLORING_KEY, topologicalColoring);
};

const LOCAL_STORAGE_LINE_FULL_PATH_KEY = "STUDY_APP_LINE_FULL_PATH";

export const getLocalStorageLineFullPath = () => getLocalStorageBoolean(LOCAL_STORAGE_LINE_FULL_PATH_KEY);

export const saveLocalStorageLineFullPath = (lineFullPath) => {
    localStorage.setItem(LOCAL_STORAGE_LINE_FULL_PATH_KEY, lineFullPath);
};

const LOCAL_STORAGE_LINE_FLOW_MODE_KEY = "STUDY_APP_LINE_FLOW_MODE";

export const getLocalStorageLineFlowMode = () => {
    const value = localStorage.getItem(LOCAL_STORAGE_LINE_FLOW_MODE_KEY);
    return value || "none";
};

export const saveLocalStorageLineFlowMode = (lineFlowMode) => {
    localStorage.setItem(LOCAL_STORAGE_LINE_FLOW_MODE_KEY, lineFlowMode);
};
