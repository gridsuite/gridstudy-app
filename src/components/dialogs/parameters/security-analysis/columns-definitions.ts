/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const LIMIT_REDUCTIONS_FORM = 'limitReductionsForm';
export const VOLTAGE_LEVELS_FORM = 'voltageLevelsForm';
export const IST_FORM = 'istForm';
export const LIMIT_DURATION1_FORM = 'limitReduction1Form';
export const LIMIT_DURATION2_FORM = 'limitReduction2Form';
export const LIMIT_DURATION3_FORM = 'limitReduction3Form';

export enum TAB_VALUES {
    'General' = 0,
    'LimitReductions' = 1,
}

export interface IColumnsDef {
    label: string;
    dataKey: string;
    width?: string;
}

export const COLUMNS_DEFINITIONS_LIMIT_REDUCTIONS = [
    {
        label: 'VoltageLevels',
        dataKey: 'voltageLevels',
        width: '40%',
    },
    {
        label: 'IST',
        dataKey: 'ist',
        width: '20%',
    },
    {
        label: 'LimitDuration10',
        dataKey: 'limitDuration10',
        width: '20%',
    },
    {
        label: 'LimitDuration5',
        dataKey: 'limitDuration5',
        width: '20%',
    },
    {
        label: 'LimitDuration0',
        dataKey: 'limitDuration0',
        width: '20%',
    },
];

export interface ILimitReductionsParameters {
    columnsDef: IColumnsDef[];
    name: string;
}

export const LimitReductionsParameters: ILimitReductionsParameters = {
    columnsDef: COLUMNS_DEFINITIONS_LIMIT_REDUCTIONS,
    name: 'limitReductions',
};
