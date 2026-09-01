/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { qualityParametersFields, TabValue } from './state-estimation-parameters-utils';
import {
    QUALITY_PER_REGION,
    THRESHOLD_ACT_REDUNDANCY,
    THRESHOLD_NB_CRITICAL_MEASURE,
    THRESHOLD_NB_INVALID_MEASURE,
    THRESHOLD_NB_ITER,
    THRESHOLD_NB_LOST_INJECTIONS,
    THRESHOLD_NB_LOST_TRANSITS,
    THRESHOLD_NB_OUT_BOUNDS_GAP,
    THRESHOLD_OBSERVABILITY_RATE,
    THRESHOLD_PER_VOLTAGE_LEVEL,
    THRESHOLD_REA_REDUNDANCY,
    VOLTAGE_LEVEL,
} from '../../../utils/field-constants';
import { useMemo } from 'react';
import { Box } from '@mui/material';
import LineSeparator from '../../commons/line-separator';
import { useIntl } from 'react-intl';
import {
    CustomVoltageLevelTable,
    GridSection,
    LimitReductionIColumnsDef,
    ParameterField,
    ParameterType,
    SpecificParameterInfos,
} from '@gridsuite/commons-ui';

const basicParams: SpecificParameterInfos[] = [
    {
        name: QUALITY_PER_REGION,
        type: ParameterType.BOOLEAN,
        label: 'qualityPerRegion',
    },
    {
        name: THRESHOLD_OBSERVABILITY_RATE,
        type: ParameterType.DOUBLE,
        label: 'thresholdObservabilityRate',
    },
    {
        name: THRESHOLD_ACT_REDUNDANCY,
        type: ParameterType.DOUBLE,
        label: 'thresholdActRedundancy',
    },
    {
        name: THRESHOLD_REA_REDUNDANCY,
        type: ParameterType.DOUBLE,
        label: 'thresholdReaRedundancy',
    },
    {
        name: THRESHOLD_NB_LOST_INJECTIONS,
        type: ParameterType.DOUBLE,
        label: 'thresholdNbLostInjections',
    },
    {
        name: THRESHOLD_NB_INVALID_MEASURE,
        type: ParameterType.DOUBLE,
        label: 'thresholdNbInvalidMeasure',
    },
    {
        name: THRESHOLD_NB_CRITICAL_MEASURE,
        type: ParameterType.DOUBLE,
        label: 'thresholdNbCriticalMeasure',
    },
    {
        name: THRESHOLD_NB_OUT_BOUNDS_GAP,
        type: ParameterType.DOUBLE,
        label: 'thresholdNbOutBoundsGap',
    },
    {
        name: THRESHOLD_NB_ITER,
        type: ParameterType.DOUBLE,
        label: 'thresholdNbIter',
    },
    {
        name: THRESHOLD_NB_LOST_TRANSITS,
        type: ParameterType.DOUBLE,
        label: 'thresholdNbLostTransits',
    },
];

export const StateEstimationQualityParameters = () => {
    const intl = useIntl();

    const columnsDefinition = useMemo<LimitReductionIColumnsDef[]>(() => {
        const definition = [
            {
                dataKey: VOLTAGE_LEVEL,
                label: intl.formatMessage({ id: 'voltageRange' }),
                tooltip: intl.formatMessage({ id: 'voltageRange' }),
            },
        ];
        definition.push(
            ...qualityParametersFields.map((parameter) => {
                return {
                    dataKey: parameter,
                    label: intl.formatMessage({ id: parameter }),
                    tooltip: intl.formatMessage({ id: parameter }),
                };
            })
        );
        return definition;
    }, [intl]);

    return (
        <>
            <GridSection title="StateEstimationParametersQualitySection" heading={4} />
            {basicParams.map((item) => (
                <ParameterField id={TabValue.QUALITY} {...item} key={item.name} />
            ))}
            <Box my={2}>
                <LineSeparator />
            </Box>
            <CustomVoltageLevelTable
                formName={`${TabValue.QUALITY}.${THRESHOLD_PER_VOLTAGE_LEVEL}`}
                columnsDefinition={columnsDefinition}
                tableHeight={550}
                tableMinWidth={1000}
            />
        </>
    );
};
