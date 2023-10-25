/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
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
    INITIAL_TENSION,
    INITIAL_VOLTAGE_PROFILE_MODE,
    PREDEFINED_PARAMETERS,
    STATUS,
} from '../../../utils/constants';
import { gridItem, GridSection } from '../../dialogUtils';
import { useIntl } from 'react-intl';
import { Lens } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import { useWatch } from 'react-hook-form';
import TensionTable from './short-circuit-tension-table';

interface ShortCircuitFieldsProps {
    resetAll: (predefinedParams: string) => void;
}
const ShortCircuitFields: FunctionComponent<ShortCircuitFieldsProps> = ({
    resetAll,
}) => {
    const [status, setStatus] = useState(STATUS.SUCCESS);
    const watchInitialVoltageProfileMode = useWatch({
        name: SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE,
    });

    const watchPredefinedParams = useWatch({
        name: SHORT_CIRCUIT_PREDEFINED_PARAMS,
    });

    const styles = {
        cell: {
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
            flex: 1,
            cursor: 'initial',
        },
        succeed: {
            color: green[500],
        },
        fail: {
            color: red[500],
        },
    };

    const intl = useIntl();

    const predefinedParameter = (
        <SelectInput
            name={SHORT_CIRCUIT_PREDEFINED_PARAMS}
            options={PREDEFINED_PARAMETERS}
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

    const getStatus = (status: STATUS) => {
        const color = status === STATUS.SUCCESS ? styles.succeed : styles.fail;
        return <Lens fontSize={'medium'} sx={color} />;
    };
    const statusRender = getStatus(status);

    useEffect(() => {
        setStatus(STATUS.SUCCESS);
        if (
            watchInitialVoltageProfileMode === 'NOMINAL' &&
            watchPredefinedParams !== 'NOMINAL'
        ) {
            setStatus(STATUS.ERROR);
        }
        if (
            watchInitialVoltageProfileMode === 'CONFIGURED' &&
            watchPredefinedParams !== 'CONFIGURED'
        ) {
            setStatus(STATUS.ERROR);
        }
    }, [watchInitialVoltageProfileMode]);
    useEffect(() => {
        // todo: add more control when backEnd is done
        resetAll(watchPredefinedParams);
    }, [watchPredefinedParams, resetAll]);

    return (
        <Grid container spacing={2} paddingLeft={2}>
            <Grid container paddingTop={2}>
                {gridItem(feederResult, 12)}
            </Grid>
            <GridSection
                title="ShortCircuitPredefinedParameters"
                heading={'4'}
            />
            <Grid container spacing={1} alignItems={'center'}>
                {gridItem(predefinedParameter, 8)}
                {gridItem(statusRender, 4)}
            </Grid>
            <GridSection title="ShortCircuitCharacteristics" heading={'4'} />
            <Grid>
                {gridItem(loads, 6)}
                {gridItem(shuntCompensators, 6)}
            </Grid>
            <Grid marginLeft={4}>
                {gridItem(vsc, 4)}
                {gridItem(neutralPosition, 8)}
            </Grid>

            <GridSection title="ShortCircuitVoltageProfileMode" heading={'4'} />
            <Grid>{gridItem(variationTypeField, 12)}</Grid>
            <TensionTable
                isNominal={
                    watchInitialVoltageProfileMode === INITIAL_TENSION.NOMINAL
                }
            />
        </Grid>
    );
};
export default ShortCircuitFields;
