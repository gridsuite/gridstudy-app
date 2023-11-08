/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
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
    PREDEFINED_PARAMETERS,
    STATUS,
} from '../../../utils/constants';
import { gridItem, GridSection } from '../../dialogUtils';
import { useIntl } from 'react-intl';
import { green, red } from '@mui/material/colors';
import { useWatch } from 'react-hook-form';
import TensionTable from './short-circuit-tension-table';
import {
    getStatus,
    intlInitialVoltageProfileMode,
    intlPredefinedParametersOptions,
} from './short-circuit-parameters-utils';
import { ShortCircuitFieldsProps } from './short-circuit-parameters.type';

const ShortCircuitFields: FunctionComponent<ShortCircuitFieldsProps> = ({
    resetAll,
    voltageRanges,
}) => {
    const intl = useIntl();

    const [status, setStatus] = useState(STATUS.SUCCESS);
    const [isChanged, setIsChanged] = useState(false);

    const watchInitialVoltageProfileMode = useWatch({
        name: SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE,
    });
    const watchPredefinedParams = useWatch({
        name: SHORT_CIRCUIT_PREDEFINED_PARAMS,
    });

    // the tranlsation of values
    const predefinedParamsOptions = useMemo(() => {
        return intlPredefinedParametersOptions(intl);
    }, [intl]);
    const initialVoltageProfileMode = useMemo(() => {
        return intlInitialVoltageProfileMode(intl);
    }, [intl]);

    const statusToShow = useMemo(() => {
        const styles = {
            succeed: {
                color: green[500],
            },
            fail: {
                color: red[500],
            },
        };
        return getStatus(status, styles);
    }, [status]);

    const onChangeCallback = useCallback(() => {
        setIsChanged(true);
    }, [setIsChanged]);

    // fields definition
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
    const predefinedParameters = (
        <SelectInput
            name={SHORT_CIRCUIT_PREDEFINED_PARAMS}
            options={predefinedParamsOptions}
            onChangeCallback={onChangeCallback}
            disableClearable
        />
    );

    const initialVoltageProfileModeField = (
        <RadioInput
            name={SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE}
            options={Object.values(initialVoltageProfileMode)}
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

    useEffect(() => {
        // in order to show the right status we need to check the predefinedParams and initial voltage profile mode values
        // show success only when ICC_MAX_WITH_NOMINAL_VOLTAGE_MAP is associated to NOMINAL or ICC_MAX_WITH_CEI909 to CONFIGURED
        const isNominal =
            watchPredefinedParams ===
                PREDEFINED_PARAMETERS.ICC_MAX_WITH_NOMINAL_VOLTAGE_MAP &&
            watchInitialVoltageProfileMode === INITIAL_TENSION.NOMINAL;

        const isConfigured =
            watchPredefinedParams ===
                PREDEFINED_PARAMETERS.ICC_MAX_WITH_CEI909 &&
            watchInitialVoltageProfileMode === INITIAL_TENSION.CONFIGURED;

        if (isNominal || isConfigured) {
            setStatus(STATUS.SUCCESS);
        } else {
            setStatus(STATUS.ERROR);
        }
    }, [watchInitialVoltageProfileMode, watchPredefinedParams]);

    // reset all fields when predefined parameters changes
    useEffect(() => {
        if (isChanged) {
            resetAll(watchPredefinedParams);
            setIsChanged(false);
        }
    }, [watchPredefinedParams, resetAll, isChanged]);

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
                {gridItem(predefinedParameters, 8)}
                {gridItem(statusToShow, 4)}
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
            <Grid>{gridItem(initialVoltageProfileModeField, 12)}</Grid>
            <TensionTable
                voltageProfileMode={watchInitialVoltageProfileMode}
                values={voltageRanges}
            />
        </Grid>
    );
};
export default ShortCircuitFields;
