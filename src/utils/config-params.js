/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const COMMON_APP_NAME = 'common';
export const APP_NAME = 'study';

export const PARAM_THEME = 'theme';
export const PARAM_USE_NAME = 'useName';
export const PARAM_CENTER_LABEL = 'centerLabel';
export const PARAM_DIAGONAL_LABEL = 'diagonalLabel';
export const PARAM_LINE_FULL_PATH = 'lineFullPath';
export const PARAM_LINE_PARALLEL_PATH = 'lineParallelPath';
export const PARAM_LINE_FLOW_MODE = 'lineFlowMode';
export const PARAM_LINE_FLOW_COLOR_MODE = 'lineFlowColorMode';
export const PARAM_LINE_FLOW_ALERT_THRESHOLD = 'lineFlowAlertThreshold';
export const PARAM_DISPLAY_OVERLOAD_TABLE = 'displayOverloadTable';
export const PARAM_SUBSTATION_LAYOUT = 'substationLayout';
export const PARAM_COMPONENT_LIBRARY = 'componentLibrary';
export const PARAM_LANGUAGE = 'language';

export const PARAM_FAVORITE_CONTINGENCY_LISTS = 'favoriteContingencyLists';

const COMMON_CONFIG_PARAMS_NAMES = new Set([PARAM_THEME, PARAM_LANGUAGE]);

export function getAppName(paramName) {
    return COMMON_CONFIG_PARAMS_NAMES.has(paramName)
        ? COMMON_APP_NAME
        : APP_NAME;
}
