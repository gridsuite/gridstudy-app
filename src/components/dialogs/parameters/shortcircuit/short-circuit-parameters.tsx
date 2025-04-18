/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useEffect, useMemo, useState } from 'react';
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
import { CheckboxInput, FieldLabel, MuiSelectInput, RadioInput, SwitchInput } from '@gridsuite/commons-ui';

import { INITIAL_VOLTAGE, PREDEFINED_PARAMETERS, STATUS } from '../../../utils/constants';
import { green, red } from '@mui/material/colors';
import { useWatch } from 'react-hook-form';
import VoltageTable from './short-circuit-voltage-table';
import {
    getStatus,
    intlInitialVoltageProfileMode,
    intlPredefinedParametersOptions,
} from './short-circuit-parameters-utils';
import { ShortCircuitFieldsProps } from './short-circuit-parameters.type';
import GridItem from '../../commons/grid-item';
import GridSection from '../../commons/grid-section';

const ShortCircuitFields: FunctionComponent<ShortCircuitFieldsProps> = ({ resetAll }) => {
    const [status, setStatus] = useState(STATUS.SUCCESS);

    const watchInitialVoltageProfileMode = useWatch({
        name: SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE,
    });
    const watchPredefinedParams = useWatch({
        name: SHORT_CIRCUIT_PREDEFINED_PARAMS,
    });
    const watchLoads = useWatch({
        name: SHORT_CIRCUIT_WITH_LOADS,
    });
    const watchShuntCompensators = useWatch({
        name: SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS,
    });
    const watchVSC = useWatch({
        name: SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS,
    });
    const watchNeutralPosition = useWatch({
        name: SHORT_CIRCUIT_WITH_NEUTRAL_POSITION,
    });

    const isIccMinFeaturesDefaultConfiguration = useMemo(() => {
        return !watchLoads && !watchShuntCompensators && !watchVSC && !watchNeutralPosition;
    }, [watchLoads, watchShuntCompensators, watchVSC, watchNeutralPosition]);

    const isIccMaxFeaturesDefaultConfiguration = useMemo(() => {
        return !watchLoads && !watchShuntCompensators && watchVSC && !watchNeutralPosition;
    }, [watchLoads, watchShuntCompensators, watchVSC, watchNeutralPosition]);

    // the translation of values
    const predefinedParamsOptions = useMemo(() => {
        return intlPredefinedParametersOptions();
    }, []);
    const initialVoltageProfileMode = useMemo(() => {
        return intlInitialVoltageProfileMode();
    }, []);

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

    const onPredefinedParametersManualChange = (event: any) => {
        const newPredefinedParameters = event.target.value;
        console.debug('onPredefinedParametersManualChange new:', newPredefinedParameters);
        resetAll(newPredefinedParameters);
    };

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
        <MuiSelectInput
            name={SHORT_CIRCUIT_PREDEFINED_PARAMS}
            options={predefinedParamsOptions}
            onChange={onPredefinedParametersManualChange}
            fullWidth
        />
    );

    const initialVoltageProfileModeField = (
        <RadioInput
            name={SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE}
            options={Object.values(initialVoltageProfileMode)}
        />
    );
    const loads = <CheckboxInput name={SHORT_CIRCUIT_WITH_LOADS} label={'shortCircuitLoads'} />;
    const vsc = <CheckboxInput name={SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS} label={'shortCircuitHvdc'} />;
    const shuntCompensators = (
        <CheckboxInput name={SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS} label={'shortCircuitShuntCompensators'} />
    );
    const neutralPosition = (
        <CheckboxInput name={SHORT_CIRCUIT_WITH_NEUTRAL_POSITION} label={'shortCircuitNeutralPosition'} />
    );

    useEffect(() => {
        // in order to show the right status we need to check the predefinedParams and initial voltage profile mode values
        // show success only if ICC_MAX_WITH_NOMINAL_VOLTAGE_MAP is associated to NOMINAL or ICC_MAX_WITH_CEI909 to CEI909 or ICC_MIN_WITH_NOMINAL_VOLTAGE_MAP is associated to NOMINAL
        const isIccMaxWithNominalVoltageMap =
            watchPredefinedParams === PREDEFINED_PARAMETERS.ICC_MAX_WITH_NOMINAL_VOLTAGE_MAP;

        const isIccMinWithNominal = watchPredefinedParams === PREDEFINED_PARAMETERS.ICC_MIN_WITH_NOMINAL_VOLTAGE_MAP;

        const isInitialVoltageNominal = watchInitialVoltageProfileMode === INITIAL_VOLTAGE.NOMINAL;

        const isIccMaxNominalDefaultConfiguration = isIccMaxWithNominalVoltageMap && isInitialVoltageNominal;
        const isIccMinNominalDefaultConfiguration = isIccMinWithNominal && isInitialVoltageNominal;

        const isCEI909DefaultConfiguration =
            watchPredefinedParams === PREDEFINED_PARAMETERS.ICC_MAX_WITH_CEI909 &&
            watchInitialVoltageProfileMode === INITIAL_VOLTAGE.CEI909;

        const isIccMaxDefaultConfiguration =
            (isIccMaxNominalDefaultConfiguration || isCEI909DefaultConfiguration) &&
            isIccMaxFeaturesDefaultConfiguration;

        const isIccMinDefaultConfiguration =
            isIccMinNominalDefaultConfiguration && isIccMinFeaturesDefaultConfiguration;

        setStatus(isIccMaxDefaultConfiguration || isIccMinDefaultConfiguration ? STATUS.SUCCESS : STATUS.ERROR);
    }, [
        watchInitialVoltageProfileMode,
        watchPredefinedParams,
        isIccMaxFeaturesDefaultConfiguration,
        isIccMinFeaturesDefaultConfiguration,
    ]);

    return (
        <Grid container spacing={2} paddingLeft={2}>
            <Grid container paddingTop={2} xl={6}>
                <GridItem size={9}>{feederResult}</GridItem>
            </Grid>
            <GridSection title="ShortCircuitPredefinedParameters" heading={4} />
            <Grid xl={6} container spacing={1} alignItems={'center'}>
                <GridItem size={8}>{predefinedParameters}</GridItem>
                <GridItem size={4}>{statusToShow}</GridItem>
            </Grid>
            <GridSection title="ShortCircuitCharacteristics" heading={4} />
            <Grid container spacing={5}>
                <Grid item>
                    <GridItem>{loads}</GridItem>
                    <GridItem>{shuntCompensators}</GridItem>
                </Grid>
                <Grid item xs={8}>
                    <GridItem>{vsc}</GridItem>
                    <GridItem>{neutralPosition}</GridItem>
                </Grid>
            </Grid>
            <GridSection title="ShortCircuitVoltageProfileMode" heading={4} />
            <Grid container>
                <GridItem size={12}>{initialVoltageProfileModeField}</GridItem>
            </Grid>
            <VoltageTable voltageProfileMode={watchInitialVoltageProfileMode} />
        </Grid>
    );
};
export default ShortCircuitFields;
