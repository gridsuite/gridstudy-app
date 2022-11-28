/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    Grid,
    MenuItem,
    Box,
    Select,
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
    getDefaultLoadFlowProvider,
    getLoadFlowParameters,
    getLoadFlowProvider,
    setLoadFlowParameters,
    setLoadFlowProvider,
} from '../../../utils/rest-api';
import { useSnackMessage } from '../../../utils/messages';
import { useSelector } from 'react-redux';
import { SwitchWithLabel } from './parameters';
import { LineSeparator } from '../dialogUtils';
const LF_PROVIDER_VALUES = {
    OpenLoadFlow: 'OpenLoadFlow',
    Hades2: 'Hades2',
};

export const useGetLfParamsAndProvider = () => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const { snackError } = useSnackMessage();

    const [lfProvider, setLfProvider] = useState(null);

    const [lfParams, setLfParams] = useState(null);

    const updateLfProvider = useCallback(
        (newProvider) => {
            setLoadFlowProvider(studyUuid, newProvider)
                .then(() => setLfProvider(newProvider))
                .catch((errorMessage) => {
                    snackError({
                        messageTxt: errorMessage,
                        headerId: 'setLoadFlowProviderError',
                    });
                });
        },
        [studyUuid, snackError]
    );

    const setLoadFlowProviderToDefault = useCallback(() => {
        getDefaultLoadFlowProvider()
            .then((defaultLFProvider) => {
                updateLfProvider(
                    defaultLFProvider in LF_PROVIDER_VALUES
                        ? defaultLFProvider
                        : LF_PROVIDER_VALUES.OpenLoadFlow
                );
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'defaultLoadflowRetrievingError',
                });
            });
    }, [updateLfProvider, snackError]);

    useEffect(() => {
        if (studyUuid) {
            getLoadFlowParameters(studyUuid)
                .then((params) => setLfParams(params))
                .catch((errorMessage) => {
                    snackError({
                        messageTxt: errorMessage,
                        headerId: 'paramsRetrievingError',
                    });
                });
            getLoadFlowProvider(studyUuid)
                .then((provider) => {
                    // if provider is not defined or not among allowed values, it's set to default value
                    if (!(provider in LF_PROVIDER_VALUES)) {
                        setLoadFlowProviderToDefault();
                    } else {
                        setLfProvider(provider);
                    }
                })
                .catch((errorMessage) => {
                    snackError({
                        messageTxt: errorMessage,
                        headerId: 'getLoadFlowProviderError',
                    });
                });
        }
    }, [studyUuid, snackError, setLoadFlowProviderToDefault]);

    return [
        lfParams,
        lfProvider,
        setLfParams,
        updateLfProvider,
        setLoadFlowProviderToDefault,
    ];
};

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

const DropDown = ({ value, label, values, callback }) => {
    const classes = useStyles();
    return (
        <>
            <Grid item xs={8}>
                <Typography component="span" variant="body1">
                    <Box fontWeight="fontWeightBold" m={1}>
                        <FormattedMessage id={label} />
                    </Box>
                </Typography>
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <Select
                    labelId={label}
                    value={value}
                    onChange={callback}
                    size="small"
                >
                    {Object.keys(values).map((key) => (
                        <MenuItem key={key} value={key}>
                            <FormattedMessage id={values[key]} />
                        </MenuItem>
                    ))}
                </Select>
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
    lfParamsAndLfProvider,
    showAdvancedLfParams,
    setShowAdvancedLfParams,
}) => {
    const classes = useStyles();

    const { snackError } = useSnackMessage();

    const studyUuid = useSelector((state) => state.studyUuid);

    const [
        lfParams,
        lfProvider,
        setLfParams,
        updateLfProvider,
        setLoadFlowProviderToDefault,
    ] = lfParamsAndLfProvider;

    const updateLfProviderCallback = useCallback(
        (evt) => {
            updateLfProvider(evt.target.value);
        },
        [updateLfProvider]
    );

    const commitLFParameter = useCallback(
        (newParams) => {
            let oldParams = { ...lfParams };
            setLfParams(newParams);
            setLoadFlowParameters(studyUuid, newParams).catch(
                (errorMessage) => {
                    setLfParams(oldParams);
                    snackError({
                        messageTxt: errorMessage,
                        headerId: 'paramsChangingError',
                    });
                }
            );
        },
        [lfParams, snackError, studyUuid, setLfParams]
    );

    const resetLfParameters = useCallback(() => {
        setLoadFlowParameters(studyUuid, null)
            .then(() => {
                return getLoadFlowParameters(studyUuid)
                    .then((params) => setLfParams(params))
                    .catch((errorMessage) => {
                        snackError({
                            messageTxt: errorMessage,
                            headerId: 'paramsRetrievingError',
                        });
                    });
            })
            .catch((errorMessage) => {
                snackError({
                    messageTxt: errorMessage,
                    headerId: 'paramsChangingError',
                });
            });

        setLoadFlowProviderToDefault();
    }, [studyUuid, setLoadFlowProviderToDefault, snackError, setLfParams]);

    return (
        <Grid container className={classes.grid}>
            <Grid container key="lfProvider">
                <DropDown
                    value={lfProvider}
                    label="Provider"
                    values={LF_PROVIDER_VALUES}
                    callback={updateLfProviderCallback}
                />

                <Grid container paddingTop={1}>
                    <LineSeparator />
                </Grid>
                <BasicLoadFlowParameters
                    lfParams={lfParams || {}}
                    commitLFParameter={commitLFParameter}
                />
                <AdvancedLoadFlowParameters
                    lfParams={lfParams || {}}
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
