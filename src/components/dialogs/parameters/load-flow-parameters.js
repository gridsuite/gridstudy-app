/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    Grid,
    Box,
    Typography,
    Autocomplete,
    TextField,
    Chip,
    Button,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import { CloseButton, LabelledButton, useStyles } from './parameters';
import {
    getLoadFlowParameters,
    setLoadFlowParameters,
} from '../../../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { DropDown, SwitchWithLabel } from './parameters';
import { LineSeparator } from '../dialogUtils';

const CountrySelector = ({ value, label, callback }) => {
    const classes = useStyles();
    const countriesList = useMemo(() => {
        let countriesList;
        try {
            countriesList = require('localized-countries')(
                require('localized-countries/data/' +
                    navigator.language.substr(0, 2))
            );
        } catch (error) {
            // fallback to english if no localised list found
            countriesList = require('localized-countries')(
                require('localized-countries/data/en')
            );
        }
        return countriesList;
    }, []);

    return (
        <>
            <Grid item xs={6}>
                <Typography component="span" variant="body1">
                    <Box fontWeight="fontWeightBold" m={1}>
                        <FormattedMessage id={label} />
                    </Box>
                </Typography>
            </Grid>
            <Grid item container xs={6} className={classes.controlItem}>
                <Autocomplete
                    size="small"
                    value={value}
                    multiple={true}
                    onChange={(event, newValues) => callback(newValues)}
                    options={Object.keys(countriesList.object())}
                    getOptionLabel={(code) => countriesList.get(code)}
                    renderInput={(props) => (
                        <TextField
                            label={
                                <FormattedMessage
                                    id={
                                        value?.length === 0
                                            ? 'descLfAllCountries'
                                            : 'descLfCountries'
                                    }
                                />
                            }
                            className={classes.minWidthMedium}
                            {...props}
                        />
                    )}
                    renderTags={(val, getTagsProps) =>
                        val.map((code, index) => (
                            <Chip
                                id={'chip_' + code}
                                size={'small'}
                                label={countriesList.get(code)}
                                {...getTagsProps({ index })}
                            />
                        ))
                    }
                />
            </Grid>
        </>
    );
};

function makeComponentsFor(defParams, params, setter) {
    return Object.keys(defParams).map((key) => (
        <Grid container spacing={1} paddingTop={1} key={key}>
            {makeComponentFor(defParams[key], key, params, setter)}
            <LineSeparator />
        </Grid>
    ));
}

function getValue(param, key) {
    if (!param || param[key] === undefined) return null;
    return param[key];
}
function makeComponentFor(defParam, key, lfParams, setter) {
    const value = getValue(lfParams, key);
    if (defParam.type === TYPES.bool) {
        return (
            <SwitchWithLabel
                value={value}
                label={defParam.description}
                callback={(ev) =>
                    setter({ ...lfParams, [key]: ev.target.checked })
                }
            />
        );
    } else if (defParam.type === TYPES.enum) {
        return (
            <DropDown
                value={value}
                label={defParam.description}
                values={defParam.values}
                callback={(ev) =>
                    setter({ ...lfParams, [key]: ev.target.value })
                }
            />
        );
    } else if (defParam.type === TYPES.countries) {
        return (
            <CountrySelector
                value={value || []}
                label={defParam.description}
                callback={(newValues) => {
                    setter({ ...lfParams, [key]: [...newValues] });
                }}
            />
        );
    }
}

const TYPES = {
    enum: 'Enum',
    bool: 'Bool',
    countries: 'Countries',
};

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

    const { snackError } = useSnackMessage();

    const studyUuid = useSelector((state) => state.studyUuid);

    const [
        providers,
        provider,
        updateProvider,
        resetProvider,
        params,
        setParams,
    ] = parametersBackend;

    const updateLfProviderCallback = useCallback(
        (evt) => {
            updateProvider(evt.target.value);
        },
        [updateProvider]
    );

    const commitLFParameter = useCallback(
        (newParams) => {
            let oldParams = { ...params };
            setParams(newParams);
            setLoadFlowParameters(studyUuid, newParams).catch((error) => {
                setParams(oldParams);
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });
        },
        [params, snackError, studyUuid, setParams]
    );

    const resetLfParameters = useCallback(() => {
        setLoadFlowParameters(studyUuid, null)
            .then(() => {
                return getLoadFlowParameters(studyUuid)
                    .then((params) => setParams(params))
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'paramsRetrievingError',
                        });
                    });
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });

        resetProvider();
    }, [studyUuid, resetProvider, snackError, setParams]);

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
                    commitLFParameter={commitLFParameter}
                />
                <AdvancedLoadFlowParameters
                    lfParams={params || {}}
                    commitLFParameter={commitLFParameter}
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
                        callback={resetLfParameters}
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
