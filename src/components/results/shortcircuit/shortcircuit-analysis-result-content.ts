/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const PAGE_OPTIONS = [25, 100, 500, 1000];

export const DEFAULT_PAGE_COUNT = PAGE_OPTIONS[0];

export const FROM_COLUMN_TO_FIELD: Record<string, string> = {
    elementId: 'fault.id',
    faultType: 'fault.faultType',
    connectableId: 'feederResults.connectableId',
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
    connectableId: 'connectableId',
    current: 'fortescueCurrent.positiveMagnitude',
};
