/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const APP_NAME = 'study';

// App config names
export const PARAM_USE_NAME = 'useName';
export const PARAM_LIMIT_REDUCTION = 'limitReduction';
export const PARAM_COMPUTED_LANGUAGE = 'computedLanguage';
export const PARAMS_LOADED = 'paramsLoaded';

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
export const PARAM_PROVIDER_DYNAWO = 'Dynawo';

export const basemap_style_theme_key = (basemap: string) => basemap + 'Style';
