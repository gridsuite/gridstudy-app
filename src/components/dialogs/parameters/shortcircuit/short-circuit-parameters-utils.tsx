/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { IntlShape } from 'react-intl';
import React from 'react';
import { INITIAL_TENSION, STATUS } from '../../../utils/constants';
import { Lens } from '@mui/icons-material';
import { VoltageRange, VoltageRanges } from './short-circuit-parameters.type';

export const intlPredefinedParametersOptions = (intl: IntlShape) => [
    {
        id: 'ICC_MAX_WITH_NOMINAL_VOLTAGE_MAP',
        label: intl.formatMessage({
            id: 'iccMawWithNominalVoltageMapPredefinedParams',
        }),
    },
    {
        id: 'ICC_MAX_WITH_CEI909',
        label: intl.formatMessage({
            id: 'iccMaxWithCEIPredefinedParams',
        }),
    },
];

export const intlInitialVoltageProfileMode = (intl: IntlShape) => {
    return {
        NOMINAL: {
            id: 'NOMINAL',
            label: intl.formatMessage({
                id: 'nominalInitialVoltageProfileMode',
            }),
        },
        CONFIGURED: {
            id: 'CONFIGURED',
            label: intl.formatMessage({
                id: 'configuredInitialVoltageProfileMode',
            }),
        },
    };
};

export const getStatus = (status: STATUS, styles: any) => {
    const color = status === STATUS.SUCCESS ? styles.succeed : styles.fail;
    return <Lens fontSize={'medium'} sx={color} />;
};

const getSortedValues = (values: VoltageRange[], isNominal: boolean) => {
    return values
        .map((value) =>
            isNominal
                ? value.minimumNominalVoltage
                : value.maximumNominalVoltage
        )
        .sort((prev: number, next: number) => next - prev);
};
export const getValues = (
    values: VoltageRanges,
    voltageProfileMode: INITIAL_TENSION
): { initialTension: number[]; nominalTension: number[] } => {
    const voltageRanges =
        voltageProfileMode === INITIAL_TENSION.NOMINAL
            ? values.NOMINAL
            : values.CONFIGURED;
    const initialTension = getSortedValues(voltageRanges, false);
    const nominalTension = getSortedValues(voltageRanges, true);
    return { initialTension, nominalTension };
};
