/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const COMMON_APP_NAME = 'common';
export const APP_NAME = 'study';

// Commons config names
export const PARAM_THEME = 'theme';
export const PARAM_LANGUAGE = 'language';

// App config names
export const PARAM_USE_NAME = 'useName';
export const PARAM_CENTER_LABEL = 'centerLabel';
export const PARAM_DIAGONAL_LABEL = 'diagonalLabel';
export const PARAM_LINE_FULL_PATH = 'lineFullPath';
export const PARAM_LINE_PARALLEL_PATH = 'lineParallelPath';
export const PARAM_LINE_FLOW_MODE = 'lineFlowMode';
export const PARAM_LIMIT_REDUCTION = 'limitReduction';
export const PARAM_MAP_MANUAL_REFRESH = 'mapManualRefresh';
export const PARAM_MAP_BASEMAP = 'mapBaseMap';
export const PARAM_SUBSTATION_LAYOUT = 'substationLayout';
export const PARAM_COMPONENT_LIBRARY = 'componentLibrary';
export const PARAM_COMPUTED_LANGUAGE = 'computedLanguage';
export const PARAM_DEVELOPER_MODE = 'enableDeveloperMode';
export const PARAM_INIT_NAD_WITH_GEO_DATA = 'initNadWithGeoData';
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

export const MAP_BASEMAP_MAPBOX = 'mapbox';
export const MAP_BASEMAP_CARTO = 'carto';
export const MAP_BASEMAP_CARTO_NOLABEL = 'cartonolabel';
export const basemap_style_theme_key = (basemap: string) => basemap + 'Style';

type COMMON_CONFIG_PARAMS_KEYS_TYPE = typeof PARAM_THEME | typeof PARAM_LANGUAGE;
type APP_CONFIG_PARAMS_KEYS_TYPE =
    | typeof PARAM_COMPUTED_LANGUAGE
    | typeof PARAM_LIMIT_REDUCTION
    | typeof PARAM_USE_NAME
    | typeof PARAM_LINE_FULL_PATH
    | typeof PARAM_LINE_PARALLEL_PATH
    | typeof PARAM_MAP_MANUAL_REFRESH
    | typeof PARAM_MAP_BASEMAP
    | typeof PARAM_LINE_FLOW_MODE
    | typeof PARAM_CENTER_LABEL
    | typeof PARAM_DIAGONAL_LABEL
    | typeof PARAM_SUBSTATION_LAYOUT
    | typeof PARAM_COMPONENT_LIBRARY
    | typeof PARAM_FAVORITE_CONTINGENCY_LISTS
    | typeof PARAM_DEVELOPER_MODE
    | typeof PARAM_INIT_NAD_WITH_GEO_DATA
    | typeof PARAMS_LOADED;

export type ALL_CONFIG_PARAMS_KEYS_TYPE = COMMON_CONFIG_PARAMS_KEYS_TYPE | APP_CONFIG_PARAMS_KEYS_TYPE;

const COMMON_CONFIG_PARAMS_KEYS = new Set<COMMON_CONFIG_PARAMS_KEYS_TYPE>([PARAM_THEME, PARAM_LANGUAGE]);

export function getAppName(paramName: string) {
    return COMMON_CONFIG_PARAMS_KEYS.has(paramName as COMMON_CONFIG_PARAMS_KEYS_TYPE) ? COMMON_APP_NAME : APP_NAME;
}
