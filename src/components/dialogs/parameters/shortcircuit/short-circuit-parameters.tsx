/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent } from 'react';
import { Grid, Table, TableBody, TableCell, TableRow } from '@mui/material';
import {
    SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE,
    SHORT_CIRCUIT_PREDEFINED_PARAMS,
    SHORT_CIRCUIT_WITH_FEEDER_RESULT,
    SHORT_CIRCUIT_WITH_LOADS,
    SHORT_CIRCUIT_WITH_NEUTRAL_POSITION,
    SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS,
    SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS,
} from '../../../utils/field-constants';
import {
    CheckboxInput,
    FieldLabel,
    RadioInput,
    SelectInput,
    SwitchInput,
} from '@gridsuite/commons-ui';

import {
    INITIAL_VOLTAGE_PROFILE_MODE,
    PREDEFINED_PARAMETERS,
} from '../../../utils/constants';
import { gridItem, GridSection } from '../../dialogUtils';
import { useIntl } from 'react-intl';

const ShortCircuitFields: FunctionComponent = () => {
    const intl = useIntl();

    const predefinedParameter = (
        <SelectInput
            name={SHORT_CIRCUIT_PREDEFINED_PARAMS}
            options={PREDEFINED_PARAMETERS}
            size={'small'}
        />
    );

    const feederResult = (
        <Grid container alignItems="center" spacing={2} direction={'row'}>
            <Grid item xs={10}>
                <FieldLabel label={'descWithFeederResult'} />
            </Grid>
            <Grid item xs={2}>
                <SwitchInput name={SHORT_CIRCUIT_WITH_FEEDER_RESULT} />
            </Grid>
        </Grid>
    );
    const variationTypeField = (
        <RadioInput
            name={SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE}
            options={Object.values(INITIAL_VOLTAGE_PROFILE_MODE)}
        />
    );
    const loads = (
        <CheckboxInput
            name={SHORT_CIRCUIT_WITH_LOADS}
            label={intl.formatMessage({ id: 'shortCircuitLoads' })}
        />
    );
    const vsc = (
        <CheckboxInput
            name={SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS}
            label={intl.formatMessage({ id: 'shortCircuitHvdc' })}
        />
    );
    const shuntCompensators = (
        <CheckboxInput
            name={SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS}
            label={intl.formatMessage({ id: 'shortCircuitShuntCompensators' })}
        />
    );
    const neutralPosition = (
        <CheckboxInput
            name={SHORT_CIRCUIT_WITH_NEUTRAL_POSITION}
            label={intl.formatMessage({ id: 'shortCircuitNeutralPosition' })}
        />
    );

    function createData(
        name: string,
        v1: number,
        v2: number,
        v3: number,
        v4: number,
        v5: number,
        v6: number
    ) {
        return { name, v1, v2, v3, v4, v5, v6 };
    }

    const rows = [
        createData(
            intl.formatMessage({ id: 'shortCircuitNominalVoltage' }),
            380,
            225,
            150,
            90,
            63,
            45
        ),
        createData(
            intl.formatMessage({ id: 'shortCircuitInitialTension' }),
            420,
            245,
            165,
            99,
            69.3,
            49.5
        ),
    ];

    return (
        <Grid container spacing={2} paddingLeft={2}>
            <Grid container spacing={2} paddingTop={2}>
                {gridItem(feederResult, 12)}
            </Grid>
            <GridSection title="ShortCircuitPredefinedParameters" />
            <Grid container spacing={2}>
                {gridItem(predefinedParameter, 8)}
            </Grid>
            <GridSection title="ShortCircuitCharacteristics" />
            <Grid spacing={2}>
                {gridItem(loads, 6)}
                {gridItem(vsc, 6)}
            </Grid>
            <Grid spacing={2}>
                {gridItem(shuntCompensators, 4)}
                {gridItem(neutralPosition, 8)}
            </Grid>

            <GridSection title="ShortCircuitVoltageProfileMode" />
            <Grid spacing={2}>{gridItem(variationTypeField, 12)}</Grid>
            <Table>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.name}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.v1}</TableCell>
                            <TableCell>{row.v2}</TableCell>
                            <TableCell>{row.v3}</TableCell>
                            <TableCell>{row.v4}</TableCell>
                            <TableCell>{row.v5}</TableCell>
                            <TableCell>{row.v6}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Grid>
    );
};
export default ShortCircuitFields;
