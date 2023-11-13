/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import { INITIAL_VOLTAGE, STATUS } from '../../../utils/constants';
import { Lens } from '@mui/icons-material';
import { Pair, VoltageRanges } from './short-circuit-parameters.type';

export const intlPredefinedParametersOptions = () => [
    {
        id: 'ICC_MAX_WITH_NOMINAL_VOLTAGE_MAP',
        label: 'iccMawWithNominalVoltageMapPredefinedParams',
    },
    {
        id: 'ICC_MAX_WITH_CEI909',
        label: 'iccMaxWithCEIPredefinedParams',
    },
];

export const intlInitialVoltageProfileMode = () => {
    return {
        NOMINAL: {
            id: 'NOMINAL',
            label: 'nominalInitialVoltageProfileMode',
        },
        CEI909: {
            id: 'CEI909',
            label: 'cei909InitialVoltageProfileMode',
        },
    };
};

export const getStatus = (status: STATUS, styles: any) => {
    const color = status === STATUS.SUCCESS ? styles.succeed : styles.fail;
    return <Lens fontSize={'medium'} sx={color} />;
};

const getSortedValues = (values: Pair[], isNominal: boolean) => {
    return values
        .map((value) => (isNominal ? value.first : value.second))
        .sort((prev: number, next: number) => next - prev);
};
export const getValues = (
    values: VoltageRanges,
    voltageProfileMode: INITIAL_VOLTAGE
): { initialVoltage: number[]; nominalVoltage: number[] } => {
    const voltageRanges =
        voltageProfileMode === INITIAL_VOLTAGE.NOMINAL
            ? values.NOMINAL
            : values.CEI909;
    const initialVoltage = getSortedValues(voltageRanges, false);
    const nominalVoltage = getSortedValues(voltageRanges, true);
    return { initialVoltage, nominalVoltage };
};
