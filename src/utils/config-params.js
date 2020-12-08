/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const PARAMS_THEME_KEY = 'theme';
export const PARAMS_USE_NAME_KEY = 'useName';
export const PARAMS_CENTER_LABEL_KEY = 'centerLabel';
export const PARAMS_DIAGONAL_LABEL_KEY = 'diagonalLabel';
export const PARAMS_LINE_FULL_PATH_KEY = 'lineFullPath';
export const PARAMS_LINE_PARALLEL_PATH_KEY = 'lineParallelPath';
export const PARAMS_LINE_FLOW_MODE_KEY = 'lineFlowMode';
export const PARAMS_LINE_FLOW_COLOR_MODE_KEY = 'lineFlowColorMode';
export const PARAMS_LINE_FLOW_ALERT_THRESHOLD_KEY = 'lineFlowAlertThreshold';
export const PARAMS_VIEW_OVERLOADS_TABLE_KEY = 'viewOverloadsTable';
export const PARAMS_SUBSTATION_LAYOUT_KEY = 'substationLayout';

export const defaultParams = [
    {
        key: PARAMS_THEME_KEY,
        value: 'Dark',
    },
    {
        key: PARAMS_SUBSTATION_LAYOUT_KEY,
        value: 'horizontal',
    },
    {
        key: PARAMS_USE_NAME_KEY,
        value: 'true',
    },
    {
        key: PARAMS_CENTER_LABEL_KEY,
        value: 'false',
    },
    {
        key: PARAMS_DIAGONAL_LABEL_KEY,
        value: 'false',
    },
    {
        key: PARAMS_LINE_FULL_PATH_KEY,
        value: 'true',
    },
    {
        key: PARAMS_LINE_PARALLEL_PATH_KEY,
        value: 'true',
    },
    {
        key: PARAMS_LINE_FLOW_MODE_KEY,
        value: 'feeders',
    },
    {
        key: PARAMS_LINE_FLOW_COLOR_MODE_KEY,
        value: 'nominalVoltage',
    },
    {
        key: PARAMS_LINE_FLOW_ALERT_THRESHOLD_KEY,
        value: '100',
    },
    {
        key: PARAMS_VIEW_OVERLOADS_TABLE_KEY,
        value: 'false',
    },
];
