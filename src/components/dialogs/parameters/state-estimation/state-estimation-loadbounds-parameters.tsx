/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useMemo } from 'react';
import { DEFAULT_BOUNDS, DEFAULT_FIXED_BOUNDS, VOLTAGE_LEVEL } from '../../../utils/field-constants';
import { loadboundsParametersFields, TabValue } from './state-estimation-parameters-utils';
import { IColumnsDef } from '../common/limitreductions/columns-definitions';
import { useIntl } from 'react-intl';
import { Box, Grid } from '@mui/material';
import LineSeparator from '../../commons/line-separator';
import GridSection from '../../commons/grid-section';
import CustomVoltageLevelTable from '../common/voltage-level-table/custom-voltage-level-table';

export const StateEstimationLoadboundsParameters: FunctionComponent = () => {
    const intl = useIntl();

    const columnsDefinition = useMemo<IColumnsDef[]>(() => {
        const definition = [
            {
                dataKey: VOLTAGE_LEVEL,
                label: intl.formatMessage({ id: 'voltageRange' }),
                tooltip: intl.formatMessage({ id: 'voltageRange' }),
            },
        ];
        definition.push(
            ...loadboundsParametersFields.map((parameter) => {
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
        <Grid container>
            <GridSection title="StateEstimationParametersDefaultBoundsSection" heading={4} />

            <CustomVoltageLevelTable
                formName={`${TabValue.LOADBOUNDS}.${DEFAULT_BOUNDS}`}
                columnsDefinition={columnsDefinition}
                tableHeight={450}
            />

            <Box my={2}>
                <LineSeparator />
            </Box>
            <GridSection title="StateEstimationParametersDefaultFixedBoundsSection" heading={4} />

            <CustomVoltageLevelTable
                formName={`${TabValue.LOADBOUNDS}.${DEFAULT_FIXED_BOUNDS}`}
                columnsDefinition={columnsDefinition}
                tableHeight={450}
            />
        </Grid>
    );
};
