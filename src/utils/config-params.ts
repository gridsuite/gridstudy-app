/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LAST_SELECTED_DIRECTORY } from '@gridsuite/commons-ui';

export const COMMON_APP_NAME = 'common';
export const APP_NAME = 'study';

// Commons config names
export const PARAM_THEME = 'theme';
export const PARAM_LANGUAGE = 'language';

// App config names
export const PARAM_USE_NAME = 'useName';
export const PARAM_LIMIT_REDUCTION = 'limitReduction';
export const PARAM_COMPUTED_LANGUAGE = 'computedLanguage';
export const PARAM_DEVELOPER_MODE = 'enableDeveloperMode';
export const PARAMS_LOADED = 'paramsLoaded';
export const PARAM_FAVORITE_CONTINGENCY_LISTS = 'favoriteContingencyLists';

// SA Param names
export const PARAM_SA_PROVIDER = 'provider';
export const PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD = 'flowProportionalThreshold';
export const PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD = 'lowVoltageProportionalThreshold';
export const PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD = 'lowVoltageAbsoluteThreshold';
export const PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD = 'highVoltageProportionalThreshold';
export const PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD = 'highVoltageAbsoluteThreshold';

// Param values
export const PARAM_PROVIDER_OPENLOADFLOW = 'OpenLoadFlow';
export const PARAM_PROVIDER_DYNAFLOW = 'DynaFlow';

export const basemap_style_theme_key = (basemap: string) => basemap + 'Style';

const COMMON_CONFIG_PARAMS_NAMES = new Set([PARAM_THEME, PARAM_LANGUAGE, LAST_SELECTED_DIRECTORY]);

export function getAppName(paramName: string) {
    return COMMON_CONFIG_PARAMS_NAMES.has(paramName) ? COMMON_APP_NAME : APP_NAME;
}
