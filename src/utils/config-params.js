/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const COMMON_APP_NAME = 'common';
export const APP_NAME = 'study';

export const PARAMS_THEME_KEY = 'theme';
export const PARAMS_USE_NAME_KEY = 'useName';
export const PARAMS_CENTER_LABEL_KEY = 'centerLabel';
export const PARAMS_DIAGONAL_LABEL_KEY = 'diagonalLabel';
export const PARAMS_LINE_FULL_PATH_KEY = 'lineFullPath';
export const PARAMS_LINE_PARALLEL_PATH_KEY = 'lineParallelPath';
export const PARAMS_LINE_FLOW_MODE_KEY = 'lineFlowMode';
export const PARAMS_LINE_FLOW_COLOR_MODE_KEY = 'lineFlowColorMode';
export const PARAMS_LINE_FLOW_ALERT_THRESHOLD_KEY = 'lineFlowAlertThreshold';
export const PARAMS_DISPLAY_OVERLOAD_TABLE_KEY = 'displayOverloadTable';
export const PARAMS_SUBSTATION_LAYOUT_KEY = 'substationLayout';

const COMMON_CONFIG_PARAMS_NAMES = new Set([PARAMS_THEME_KEY]);

export function getAppName(paramName) {
    return COMMON_CONFIG_PARAMS_NAMES.has(paramName)
        ? COMMON_APP_NAME
        : APP_NAME;
}
