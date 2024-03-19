/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ShortCircuitAnalysisType } from './shortcircuit-analysis-result.type';

export const PAGE_OPTIONS = [25, 100, 500, 1000];

export const DEFAULT_PAGE_COUNT = PAGE_OPTIONS[0];
export const SHORTCIRCUIT_ANALYSIS_RESULT_FILTER =
    'shortcircuitAnalysisResultFilter';
export const ONE_BUS_TAB = 'oneBus';
export const ALL_BUSES_TAB = 'allBuses';

export const FROM_COLUMN_TO_FIELD: Record<string, string> = {
    elementId: 'fault.id',
    faultType: 'fault.faultType',
    connectableId: 'connectableId',
    current: 'current',
    limitType: 'limitViolations.limitType',
    limitMin: 'ipMin',
    limitMax: 'ipMax',
    deltaCurrentIpMin: 'deltaCurrentIpMin',
    deltaCurrentIpMax: 'deltaCurrentIpMax',
    shortCircuitPower: 'shortCircuitPower',
};

// When we filter / sort the 'current' column in one bus,
// it's actually the 'fortescueCurrent.positiveMagnitude' field in the back-end
export const FROM_COLUMN_TO_FIELD_ONE_BUS: Record<string, string> = {
    ...FROM_COLUMN_TO_FIELD,
    current: 'fortescueCurrent.positiveMagnitude',
};

export const mappingTabs = (analysisType: ShortCircuitAnalysisType): string => {
    switch (analysisType) {
        case ShortCircuitAnalysisType.ONE_BUS:
            return ONE_BUS_TAB;
        case ShortCircuitAnalysisType.ALL_BUSES:
            return ALL_BUSES_TAB;
        default:
            return '';
    }
};
