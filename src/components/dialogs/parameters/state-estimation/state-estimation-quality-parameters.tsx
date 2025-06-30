/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import GridSection from '../../commons/grid-section';
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
import { Box, Grid } from '@mui/material';
import LineSeparator from '../../commons/line-separator';
import { useIntl } from 'react-intl';
import {
    CustomVoltageLevelTable,
    FieldLabel,
    LimitReductionIColumnsDef,
    ParameterFloat,
    SwitchInput,
} from '@gridsuite/commons-ui';
import { parametersStyles } from '../util/styles';

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
            <Grid container item xs={8}>
                <GridSection title="StateEstimationParametersQualitySection" heading={4} />
                <Grid container item alignItems="center" spacing={2} direction={'row'}>
                    <Grid item xs={10} sx={parametersStyles.parameterName}>
                        <FieldLabel label={'qualityPerRegion'} />
                    </Grid>
                    <Grid item xs={2}>
                        <SwitchInput name={`${TabValue.QUALITY}.${QUALITY_PER_REGION}`} />
                    </Grid>
                </Grid>
                <ParameterFloat
                    name={`${TabValue.QUALITY}.${THRESHOLD_OBSERVABILITY_RATE}`}
                    style={parametersStyles.parameterName}
                    label={'thresholdObservabilityRate'}
                    labelSize={8}
                    inputSize={4}
                />
                <ParameterFloat
                    name={`${TabValue.QUALITY}.${THRESHOLD_ACT_REDUNDANCY}`}
                    style={parametersStyles.parameterName}
                    label={'thresholdActRedundancy'}
                    labelSize={8}
                    inputSize={4}
                />
                <ParameterFloat
                    name={`${TabValue.QUALITY}.${THRESHOLD_REA_REDUNDANCY}`}
                    style={parametersStyles.parameterName}
                    label={'thresholdReaRedundancy'}
                    labelSize={8}
                    inputSize={4}
                />
                <ParameterFloat
                    name={`${TabValue.QUALITY}.${THRESHOLD_NB_LOST_INJECTIONS}`}
                    style={parametersStyles.parameterName}
                    label={'thresholdNbLostInjections'}
                    labelSize={8}
                    inputSize={4}
                />
                <ParameterFloat
                    name={`${TabValue.QUALITY}.${THRESHOLD_NB_INVALID_MEASURE}`}
                    style={parametersStyles.parameterName}
                    label={'thresholdNbInvalidMeasure'}
                    labelSize={8}
                    inputSize={4}
                />
                <ParameterFloat
                    name={`${TabValue.QUALITY}.${THRESHOLD_NB_CRITICAL_MEASURE}`}
                    style={parametersStyles.parameterName}
                    label={'thresholdNbCriticalMeasure'}
                    labelSize={8}
                    inputSize={4}
                />
                <ParameterFloat
                    name={`${TabValue.QUALITY}.${THRESHOLD_NB_OUT_BOUNDS_GAP}`}
                    style={parametersStyles.parameterName}
                    label={'thresholdNbOutBoundsGap'}
                    labelSize={8}
                    inputSize={4}
                />
                <ParameterFloat
                    name={`${TabValue.QUALITY}.${THRESHOLD_NB_ITER}`}
                    style={parametersStyles.parameterName}
                    label={'thresholdNbIter'}
                    labelSize={8}
                    inputSize={4}
                />
                <ParameterFloat
                    name={`${TabValue.QUALITY}.${THRESHOLD_NB_LOST_TRANSITS}`}
                    style={parametersStyles.parameterName}
                    label={'thresholdNbLostTransits'}
                    labelSize={8}
                    inputSize={4}
                />
            </Grid>
            <Box my={2}>
                <LineSeparator />
            </Box>
            <CustomVoltageLevelTable
                formName={`${TabValue.QUALITY}.${THRESHOLD_PER_VOLTAGE_LEVEL}`}
                columnsDefinition={columnsDefinition}
                tableHeight={450}
            />
        </>
    );
};
