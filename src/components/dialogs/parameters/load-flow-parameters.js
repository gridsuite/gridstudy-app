import React, { useState, useCallback, useEffect } from 'react';

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
import {
    CloseButton,
    LabelledButton,
    LineSeparator,
    useStyles,
} from './parameters';
import {
    getDefaultLoadFlowProvider,
    getLoadFlowParameters,
    getLoadFlowProvider,
    setLoadFlowParameters,
    setLoadFlowProvider,
} from '../../../utils/rest-api';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../../utils/messages';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { SwitchWithLabel } from './parameters';
const LF_PROVIDER_VALUES = {
    OpenLoadFlow: 'OpenLoadFlow',
    Hades2: 'Hades2',
};

export const LoadFlowParameters = ({ hideParameters }) => {
    const classes = useStyles();

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

    const [lfProvider, setLfProvider] = useState(null);

    const [lfParams, setLfParams] = useState(null);

    const { enqueueSnackbar } = useSnackbar();

    const intlRef = useIntlRef();

    const [showAdvancedLfParams, setShowAdvancedLfParams] = useState(false);

    const studyUuid = useSelector((state) => state.studyUuid);

    const updateLfProvider = useCallback(
        (newProvider) => {
            setLoadFlowProvider(studyUuid, newProvider)
                .then(() => setLfProvider(newProvider))
                .catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'setLoadFlowProviderError',
                            intlRef: intlRef,
                        },
                    });
                });
        },
        [studyUuid, enqueueSnackbar, intlRef]
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
            .catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'defaultLoadflowRetrievingError',
                        intlRef: intlRef,
                    },
                });
            });
    }, [updateLfProvider, enqueueSnackbar, intlRef]);

    useEffect(() => {
        if (studyUuid) {
            getLoadFlowParameters(studyUuid)
                .then((params) => setLfParams(params))
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'paramsRetrievingError',
                            intlRef: intlRef,
                        },
                    })
                );
            getLoadFlowProvider(studyUuid)
                .then((provider) => {
                    // if provider is not defined or not among allowed values, it's set to default value
                    if (!(provider in LF_PROVIDER_VALUES)) {
                        setLoadFlowProviderToDefault();
                    } else {
                        setLfProvider(provider);
                    }
                })
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'getLoadFlowProviderError',
                            intlRef: intlRef,
                        },
                    })
                );
        }
    }, [studyUuid, enqueueSnackbar, intlRef, setLoadFlowProviderToDefault]);

    const updateLfProviderCallback = useCallback(
        (evt) => {
            updateLfProvider(evt.target.value);
        },
        [updateLfProvider]
    );

    const commitLFParameter = (newParams) => {
        let oldParams = { ...lfParams };
        setLfParams(newParams);
        setLoadFlowParameters(studyUuid, newParams).catch((errorMessage) => {
            setLfParams(oldParams);
            displayErrorMessageWithSnackbar({
                errorMessage: errorMessage,
                enqueueSnackbar: enqueueSnackbar,
                headerMessage: {
                    headerMessageId: 'paramsChangingError',
                    intlRef: intlRef,
                },
            });
        });
    };

    const TYPES = {
        enum: 'Enum',
        bool: 'Bool',
        countries: 'Countries',
    };

    const BasicLoadFlowParameters = () => {
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
                    PROPORTIONAL_TO_GENERATION_P_MAX:
                        'descLfBalanceTypeGenPMax',
                    PROPORTIONAL_TO_LOAD: 'descLfBalanceTypeLoad',
                    PROPORTIONAL_TO_CONFORM_LOAD:
                        'descLfBalanceTypeConformLoad',
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

        return (
            lfParams && (
                <>{makeComponentsFor(defParams, lfParams, commitLFParameter)}</>
            )
        );
    };

    const AdvancedLoadFlowParameters = () => {
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
            lfParams && (
                <>
                    {MakeAdvancedParameterButton(
                        showAdvancedLfParams,
                        'showAdvancedParameters',
                        () => setShowAdvancedLfParams(!showAdvancedLfParams)
                    )}
                    {showAdvancedLfParams &&
                        makeComponentsFor(
                            defParams,
                            lfParams,
                            commitLFParameter
                        )}
                </>
            )
        );
    };

    function MakeAdvancedParameterButton(showOpenIcon, label, callback) {
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
    }

    function makeComponentsFor(defParams, params, setter) {
        return Object.keys(defParams).map((key) => (
            <Grid container spacing={1} paddingTop={1} key={key}>
                {makeComponentFor(defParams[key], key, params, setter)}
                <LineSeparator />
            </Grid>
        ));
    }

    function makeComponentFor(defParam, key, lfParams, setter) {
        if (defParam.type === TYPES.bool) {
            return (
                <SwitchWithLabel
                    value={lfParams[key]}
                    label={defParam.description}
                    callback={(ev) =>
                        setter({ ...lfParams, [key]: ev.target.checked })
                    }
                />
            );
        } else if (defParam.type === TYPES.enum) {
            return (
                <DropDown
                    value={lfParams[key]}
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
                    value={lfParams[key]}
                    label={defParam.description}
                    callback={(newValues) => {
                        setter({ ...lfParams, [key]: [...newValues] });
                    }}
                />
            );
        }
    }

    const CountrySelector = ({ value, label, callback }) => {
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
                        multiple="true"
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

    const resetLfParameters = () => {
        setLoadFlowParameters(studyUuid, null)
            .then(() => {
                return getLoadFlowParameters(studyUuid)
                    .then((params) => setLfParams(params))
                    .catch((errorMessage) =>
                        displayErrorMessageWithSnackbar({
                            errorMessage: errorMessage,
                            enqueueSnackbar: enqueueSnackbar,
                            headerMessage: {
                                headerMessageId: 'paramsRetrievingError',
                                intlRef: intlRef,
                            },
                        })
                    );
            })
            .catch((errorMessage) =>
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'paramsChangingError',
                        intlRef: intlRef,
                    },
                })
            );

        setLoadFlowProviderToDefault();
    };
    const DropDown = ({ value, label, values, callback }) => {
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
                <BasicLoadFlowParameters />
                <AdvancedLoadFlowParameters />
                <Grid container className={classes.controlItem} maxWidth="md">
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
