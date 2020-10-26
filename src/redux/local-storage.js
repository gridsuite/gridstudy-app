/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LIGHT_THEME } from './actions';

const LOCAL_STORAGE_THEME_KEY = 'GRIDSTUDY_THEME';

export const getLocalStorageTheme = () => {
    return localStorage.getItem(LOCAL_STORAGE_THEME_KEY) || LIGHT_THEME;
};

export const saveLocalStorageTheme = (theme) => {
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
};

const LOCAL_STORAGE_USE_NAME_KEY = 'GRIDSTUDY_USE_NAME';

export const getLocalStorageBoolean = (key, defValue) => {
    const value = localStorage.getItem(key) || defValue;
    return value === 'true';
};

export const getLocalStorageUseName = () =>
    getLocalStorageBoolean(LOCAL_STORAGE_USE_NAME_KEY, 'true');

export const saveLocalStorageUseName = (useName) => {
    localStorage.setItem(LOCAL_STORAGE_USE_NAME_KEY, useName);
};

const LOCAL_STORAGE_CENTER_LABEL_KEY = 'GRIDSTUDY_CENTER_LABEL';

export const getLocalStorageCenterLabel = () =>
    getLocalStorageBoolean(LOCAL_STORAGE_CENTER_LABEL_KEY, 'false');

export const saveLocalStorageCenterLabel = (useName) => {
    localStorage.setItem(LOCAL_STORAGE_CENTER_LABEL_KEY, useName);
};

const LOCAL_STORAGE_DIAGONAL_LABEL_KEY = 'GRIDSTUDY_DIAGONAL_LABEL';

export const getLocalStorageDiagonalLabel = () =>
    getLocalStorageBoolean(LOCAL_STORAGE_DIAGONAL_LABEL_KEY, 'true');

export const saveLocalStorageDiagonalLabel = (useName) => {
    localStorage.setItem(LOCAL_STORAGE_DIAGONAL_LABEL_KEY, useName);
};

const LOCAL_STORAGE_LINE_FULL_PATH_KEY = 'GRIDSTUDY_LINE_FULL_PATH';

export const getLocalStorageLineFullPath = () =>
    getLocalStorageBoolean(LOCAL_STORAGE_LINE_FULL_PATH_KEY, 'true');

export const saveLocalStorageLineFullPath = (lineFullPath) => {
    localStorage.setItem(LOCAL_STORAGE_LINE_FULL_PATH_KEY, lineFullPath);
};

const LOCAL_STORAGE_LINE_PARALLEL_PATH_KEY = 'GRIDSTUDY_LINE_PARALLEL_PATH';

export const getLocalStorageLineParallelPath = () =>
    getLocalStorageBoolean(LOCAL_STORAGE_LINE_PARALLEL_PATH_KEY, 'true');

export const saveLocalStorageLineParallelPath = (lineParallelPath) => {
    localStorage.setItem(
        LOCAL_STORAGE_LINE_PARALLEL_PATH_KEY,
        lineParallelPath
    );
};

const LOCAL_STORAGE_LINE_FLOW_MODE_KEY = 'GRIDSTUDY_LINE_FLOW_MODE';

export const getLocalStorageLineFlowMode = () => {
    const value = localStorage.getItem(LOCAL_STORAGE_LINE_FLOW_MODE_KEY);
    return value || 'feeders';
};

export const saveLocalStorageLineFlowMode = (lineFlowMode) => {
    localStorage.setItem(LOCAL_STORAGE_LINE_FLOW_MODE_KEY, lineFlowMode);
};

const LOCAL_STORAGE_LINE_FLOW_COLOR_MODE_KEY = 'GRIDSTUDY_LINE_FLOW_COLOR_MODE';

export const getLocalStorageLineFlowColorMode = () => {
    const value = localStorage.getItem(LOCAL_STORAGE_LINE_FLOW_COLOR_MODE_KEY);
    return value || 'nominalVoltage';
};

export const saveLocalStorageLineFlowColorMode = (lineFlowColorMode) => {
    localStorage.setItem(
        LOCAL_STORAGE_LINE_FLOW_COLOR_MODE_KEY,
        lineFlowColorMode
    );
};

const LOCAL_STORAGE_LINE_FLOW_ALERT_THRESHOLD_KEY =
    'GRIDSTUDY_LINE_FLOW_ALERT_THRESHOLD';

export const getLocalStorageLineFlowAlertThreshold = () => {
    const value = localStorage.getItem(
        LOCAL_STORAGE_LINE_FLOW_ALERT_THRESHOLD_KEY
    );
    return value || 100;
};

export const saveLocalStorageLineFlowAlertThreshold = (
    lineFlowAlertThreshold
) => {
    localStorage.setItem(
        LOCAL_STORAGE_LINE_FLOW_ALERT_THRESHOLD_KEY,
        lineFlowAlertThreshold
    );
};

const LOCAL_STORAGE_VIEW_OVERLOADS_TABLE_KEY = 'GRIDSTUDY_VIEW_OVERLOADS_TABLE';

export const getLocalStorageViewOverloadsTable = () =>
    getLocalStorageBoolean(LOCAL_STORAGE_VIEW_OVERLOADS_TABLE_KEY, 'false');

export const saveLocalStorageViewOverloadsTable = (viewOverloadsTable) => {
    localStorage.setItem(
        LOCAL_STORAGE_VIEW_OVERLOADS_TABLE_KEY,
        viewOverloadsTable
    );
};

const LOCAL_STORAGE_SUBSTATION_LAYOUT_KEY = 'GRIDSTUDY_SUBSTATION_LAYOUT';

export const getLocalStorageSubstationLayout = () => {
    const value = localStorage.getItem(LOCAL_STORAGE_SUBSTATION_LAYOUT_KEY);
    return value || 'horizontal';
};

export const saveLocalStorageSubstationLayout = (substationLayout) => {
    localStorage.setItem(LOCAL_STORAGE_SUBSTATION_LAYOUT_KEY, substationLayout);
};
