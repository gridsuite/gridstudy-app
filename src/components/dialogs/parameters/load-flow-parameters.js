import React, {
    useState,
    useCallback,
    useEffect,
    useRef,
    useMemo,
} from 'react';

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
    const [lfProvider, setLfProvider] = useState(null);

    const [lfParams, setLfParams] = useState(null);

    const studyUuid = useSelector((state) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const updateLfProvider = useCallback(
        (newProvider) => {
            setLoadFlowProvider(studyUuid, newProvider)
                .then(() => setLfProvider(newProvider))
                .catch((errorMessage) =>
                    snackError(errorMessage, 'setLoadFlowProviderError')
                );
        },
        [studyUuid, snackError]
    );

    const commitLFParameter = useCallback(
        (newParams) => {
            let oldParams = { ...lfParams };
            setLfParams(newParams);
            setLoadFlowParameters(studyUuid, newParams).catch(
                (errorMessage) => {
                    setLfParams(oldParams);
                    snackError(errorMessage, 'paramsChangingError');
                }
            );
        },
        [lfParams, snackError, studyUuid]
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
                snackError(errorMessage, 'defaultLoadflowRetrievingError');
            });
    }, [updateLfProvider, snackError]);

    const resetLfParameters = useCallback(() => {
        setLoadFlowParameters(studyUuid, null)
            .then(() => {
                return getLoadFlowParameters(studyUuid)
                    .then((params) => setLfParams(params))
                    .catch((errorMessage) =>
                        snackError(errorMessage, 'paramsRetrievingError')
                    );
            })
            .catch((errorMessage) =>
                snackError(errorMessage, 'paramsChangingError')
            );

        setLoadFlowProviderToDefault();
    }, [studyUuid, setLoadFlowProviderToDefault, snackError]);

    useEffect(() => {
        if (studyUuid) {
            getLoadFlowParameters(studyUuid)
                .then((params) => setLfParams(params))
                .catch((errorMessage) =>
                    snackError(errorMessage, 'paramsRetrievingError')
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
                    snackError(errorMessage, 'getLoadFlowProviderError')
                );
        }
    }, [studyUuid, snackError, setLoadFlowProviderToDefault]);
    return [
        lfParams,
        lfProvider,
        updateLfProvider,
        commitLFParameter,
        resetLfParameters,
    ];
};

export const usePreviousValues = (props) => {
    const previousValue = useRef({});

    Object.keys(props).forEach((key) => {
        if (previousValue.current[key] !== props[key]) {
            console.log(
                'JBO Previous',
                key,
                previousValue.current[key],
                props[key]
            );
        }
    });
    previousValue.current = props;
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

const AdvancedLoadFlowParameters = ({ lfParams, commitLFParameter }) => {
    const [showAdvancedLfParams, setShowAdvancedLfParams] = useState(false);

    const classes = useStyles();
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
    console.info('showAdvancedLfParams', showAdvancedLfParams);

    return (
        <>
            {MakeAdvancedParameterButton(
                showAdvancedLfParams,
                'showAdvancedParameters',
                () => setShowAdvancedLfParams(!showAdvancedLfParams)
            )}
            {showAdvancedLfParams &&
                makeComponentsFor(defParams, lfParams, commitLFParameter)}
        </>
    );
};

export const LoadFlowParameters = ({ hideParameters }) => {
    const [
        lfParams,
        lfProvider,
        updateLfProvider,
        commitLFParameter,
        resetLfParameters,
    ] = useGetLfParamsAndProvider();

    const classes = useStyles();

    const updateLfProviderCallback = useCallback(
        (evt) => {
            if (updateLfProvider) updateLfProvider(evt.target.value);
        },
        [updateLfProvider]
    );

    usePreviousValues({
        AdvancedLoadFlowParameters,
        BasicLoadFlowParameters,
    });

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
                />

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
