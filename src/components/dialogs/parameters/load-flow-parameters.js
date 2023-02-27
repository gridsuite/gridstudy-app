/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Grid } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import { LineSeparator } from '../dialogUtils';
import { CloseButton } from './common/close-button';
import { DropDown } from './common/drop-down';
import { makeComponentsFor, TYPES } from './util/make-component-utils';
import { LabelledButton } from './common/labelled-button';
import { useStyles } from './parameters-styles';

const BasicLoadFlowParameters = ({ lfParams, commitLFParameter }) => {
    const defParams = {
        transformerVoltageControlOn: {
            type: TYPES.bool,
            description: 'descLfTransformerVoltageControlOn',
        },
        phaseShifterRegulationOn: {
            type: TYPES.bool,
            description: 'descLfPhaseShifterRegulationOn',
        },
        dc: {
            type: TYPES.bool,
            description: 'descLfDC',
        },
        balanceType: {
            type: TYPES.enum,
            description: 'descLfBalanceType',
            values: {
                PROPORTIONAL_TO_GENERATION_P: 'descLfBalanceTypeGenP',
                PROPORTIONAL_TO_GENERATION_P_MAX: 'descLfBalanceTypeGenPMax',
                PROPORTIONAL_TO_LOAD: 'descLfBalanceTypeLoad',
                PROPORTIONAL_TO_CONFORM_LOAD: 'descLfBalanceTypeConformLoad',
            },
        },
        countriesToBalance: {
            type: TYPES.countries,
            description: 'descLfCountriesToBalance',
        },
        connectedComponentMode: {
            type: TYPES.enum,
            description: 'descLfConnectedComponentMode',
            values: {
                MAIN: 'descLfConnectedComponentModeMain',
                ALL: 'descLfConnectedComponentModeAll',
            },
        },
        hvdcAcEmulation: {
            type: TYPES.bool,
            description: 'descLfHvdcAcEmulation',
        },
    };

    return makeComponentsFor(defParams, lfParams, commitLFParameter);
};

const AdvancedParameterButton = ({ showOpenIcon, label, callback }) => {
    const classes = useStyles();
    return (
        <>
            <Grid item xs={12} className={classes.advancedParameterButton}>
                <Button
                    startIcon={<SettingsIcon />}
                    endIcon={
                        showOpenIcon ? (
                            <CheckIcon style={{ color: 'green' }} />
                        ) : undefined
                    }
                    onClick={callback}
                >
                    <FormattedMessage id={label} />
                </Button>
            </Grid>
        </>
    );
};

const AdvancedLoadFlowParameters = ({
    lfParams,
    commitLFParameter,
    showAdvancedLfParams,
    setShowAdvancedLfParams,
}) => {
    const defParams = {
        voltageInitMode: {
            type: TYPES.enum,
            description: 'descLfVoltageInitMode',
            values: {
                UNIFORM_VALUES: 'descLfUniformValues',
                PREVIOUS_VALUES: 'descLfPreviousValues',
                DC_VALUES: 'descLfDcValues',
            },
        },
        noGeneratorReactiveLimits: {
            type: TYPES.bool,
            description: 'descLfNoGeneratorReactiveLimits',
        },
        twtSplitShuntAdmittance: {
            type: TYPES.bool,
            description: 'descLfTwtSplitShuntAdmittance',
        },
        readSlackBus: {
            type: TYPES.bool,
            description: 'descLfReadSlackBus',
        },
        writeSlackBus: {
            type: TYPES.bool,
            description: 'descLfWriteSlackBus',
        },
        distributedSlack: {
            type: TYPES.bool,
            description: 'descLfDistributedSlack',
        },
        shuntCompensatorVoltageControlOn: {
            type: TYPES.bool,
            description: 'descLfShuntCompensatorVoltageControlOn',
        },
        dcUseTransformerRatio: {
            type: TYPES.bool,
            description: 'descLfDcUseTransformerRatio',
        },
    };

    return (
        <>
            <AdvancedParameterButton
                showOpenIcon={showAdvancedLfParams}
                label={'showAdvancedParameters'}
                callback={() => setShowAdvancedLfParams(!showAdvancedLfParams)}
            />
            {showAdvancedLfParams &&
                makeComponentsFor(defParams, lfParams, commitLFParameter)}
        </>
    );
};

export const LoadFlowParameters = ({
    hideParameters,
    parametersBackend,
    showAdvancedLfParams,
    setShowAdvancedLfParams,
}) => {
    const classes = useStyles();

    const [
        providers,
        provider,
        updateProvider,
        resetProvider,
        params,
        updateParameters,
        resetParameters,
    ] = parametersBackend;

    const updateLfProviderCallback = useCallback(
        (evt) => {
            updateProvider(evt.target.value);
        },
        [updateProvider]
    );

    const resetLfParametersAndLfProvider = useCallback(() => {
        resetParameters();
        resetProvider();
    }, [resetParameters, resetProvider]);

    return (
        <Grid container className={classes.grid}>
            <Grid container key="provider">
                <DropDown
                    value={provider}
                    label="Provider"
                    values={providers}
                    callback={updateLfProviderCallback}
                />

                <Grid container paddingTop={1}>
                    <LineSeparator />
                </Grid>
                <BasicLoadFlowParameters
                    lfParams={params || {}}
                    commitLFParameter={updateParameters}
                />
                <AdvancedLoadFlowParameters
                    lfParams={params || {}}
                    commitLFParameter={updateParameters}
                    showAdvancedLfParams={showAdvancedLfParams}
                    setShowAdvancedLfParams={setShowAdvancedLfParams}
                />

                <Grid
                    container
                    className={
                        classes.controlItem + ' ' + classes.marginTopButton
                    }
                    maxWidth="md"
                >
                    <LabelledButton
                        callback={resetLfParametersAndLfProvider}
                        label="resetToDefault"
                    />
                    <CloseButton
                        hideParameters={hideParameters}
                        className={classes.button}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};
