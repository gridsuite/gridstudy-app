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
export const PARAM_LIMIT_REDUCTION = 'limitReduction';
export const PARAM_MAP_MANUAL_REFRESH = 'mapManualRefresh';
export const PARAM_MAP_BASEMAP = 'mapBaseMap';
export const PARAM_SUBSTATION_LAYOUT = 'substationLayout';
export const PARAM_COMPONENT_LIBRARY = 'componentLibrary';
export const PARAM_LANGUAGE = 'language';
export const PARAM_COMPUTED_LANGUAGE = 'computedLanguage';
export const PARAM_DEVELOPER_MODE = 'enableDeveloperMode';
export const PARAM_INIT_NAD_WITH_GEO_DATA = 'initNadWithGeoData';
export const PARAMS_LOADED = 'paramsLoaded';

export const PARAM_FAVORITE_CONTINGENCY_LISTS = 'favoriteContingencyLists';

export const PARAM_SA_PROVIDER = 'provider';
export const PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD = 'flowProportionalThreshold';
export const PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD = 'lowVoltageProportionalThreshold';
export const PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD = 'lowVoltageAbsoluteThreshold';
export const PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD = 'highVoltageProportionalThreshold';
export const PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD = 'highVoltageAbsoluteThreshold';

export const PARAM_PROVIDER_OPENLOADFLOW = 'OpenLoadFlow';

export const MAP_BASEMAP_MAPBOX = 'mapbox';
export const MAP_BASEMAP_CARTO = 'carto';
export const MAP_BASEMAP_CARTO_NOLABEL = 'cartonolabel';
export const basemap_style_theme_key = (basemap: string) => basemap + 'Style';

const COMMON_CONFIG_PARAMS_NAMES = new Set([PARAM_THEME, PARAM_LANGUAGE]);

export function getAppName(paramName: string) {
    return COMMON_CONFIG_PARAMS_NAMES.has(paramName) ? COMMON_APP_NAME : APP_NAME;
}
