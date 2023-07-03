/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Autocomplete, TextField, Chip, Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import {
    CloseButton,
    DropDown,
    LabelledButton,
    SwitchWithLabel,
    useParameterState,
    useStyles,
} from './parameters';
import { LabelledSlider, LineSeparator } from '../dialogUtils';
import { FlatParameters } from '@gridsuite/commons-ui';
import { LocalizedCountries } from '../../utils/localized-countries-hook';
import { flatObject, replaceAllDefaultValues } from '../../utils/utils';
import {
    PARAM_DEVELOPER_MODE,
    PARAM_LIMIT_REDUCTION,
} from '../../../utils/config-params';
const CountrySelector = ({ value, label, callback }) => {
    const classes = useStyles();
    const { translate, countryCodes } = LocalizedCountries();

    return (
        <>
            <Grid item xs={6} className={classes.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={6} className={classes.controlItem}>
                <Autocomplete
                    size="small"
                    value={value}
                    multiple={true}
                    onChange={(event, newValues) => callback(newValues)}
                    options={countryCodes}
                    getOptionLabel={(countryCode) => translate(countryCode)}
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
                                label={translate(code)}
                                {...getTagsProps({ index })}
                            />
                        ))
                    }
                />
            </Grid>
        </>
    );
};

const DoubleEditor = ({
    initValue,
    label,
    callback,
    ge = undefined,
    gt = undefined,
    le = undefined,
    lt = undefined,
}) => {
    const classes = useStyles();
    const [value, setValue] = useState(initValue);
    const [doubleError, setDoubleError] = useState(false);

    useEffect(() => {
        setValue(initValue);
    }, [initValue]);

    const updateValue = useCallback(() => {
        if (doubleError) {
            setValue(initValue);
            setDoubleError(false);
        } else if (initValue !== value) {
            const f = parseFloat(value);
            if (!isNaN(f)) {
                callback(value);
            }
        }
    }, [value, initValue, callback, doubleError]);

    const checkValue = useCallback(
        (newValue) => {
            const FloatRE = /^-?\d*[.,]?\d*$/;
            const outputTransformFloatString = (value) => {
                return value?.replace(',', '.') || '';
            };
            const m = FloatRE.exec(newValue);
            if (m) {
                const f = parseFloat(newValue);
                setDoubleError(
                    isNaN(f) ||
                        (gt !== undefined && f <= gt) ||
                        (ge !== undefined && f < ge) ||
                        (lt !== undefined && f >= lt) ||
                        (le !== undefined && f > le)
                );
                setValue(outputTransformFloatString(newValue));
            }
        },
        [ge, gt, le, lt]
    );

    return (
        <>
            <Grid item xs={8} className={classes.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <TextField
                    fullWidth
                    size="small"
                    sx={{ input: { textAlign: 'right' } }}
                    value={value}
                    onBlur={updateValue}
                    onChange={(e) => {
                        checkValue(e.target.value);
                    }}
                    error={doubleError}
                />
            </Grid>
        </>
    );
};

const fusionSpecificWithOtherParams = (allParams, specificParams) => {
    const commitParameters = allParams;
    commitParameters['specificParametersPerProvider'] =
        Object.keys(specificParams).length > 0
            ? { ...specificParams }
            : commitParameters['specificParametersPerProvider'];
    return commitParameters;
};

function makeComponentsFor(
    defParams,
    localParams,
    allParams,
    setter,
    provider
) {
    return Object.keys(defParams).map((key) => (
        <Grid container spacing={1} paddingTop={1} key={key}>
            {makeComponentFor(
                defParams[key],
                key,
                localParams,
                allParams,
                setter,
                provider
            )}
            <LineSeparator />
        </Grid>
    ));
}

function getValue(param, key) {
    if (!param || param[key] === undefined) {
        return null;
    }
    return param[key];
}

function makeComponentFor(
    defParam,
    key,
    localParams,
    allParams,
    setter,
    provider
) {
    function updateValues(newval) {
        localParams = { ...localParams, [key]: newval }; // single value update made
        let newParams = { ...allParams }; // but we send/update all params to the back
        if (provider === undefined) {
            if ('commonParameters' in newParams) {
                newParams['commonParameters'] = {
                    ...localParams,
                };
            }
        } else if (
            'specificParametersPerProvider' in newParams &&
            provider in newParams['specificParametersPerProvider']
        ) {
            newParams['specificParametersPerProvider'][provider] = {
                ...localParams,
            };
        }
        setter(newParams);
    }

    const value = getValue(localParams, key);
    if (defParam.type === TYPES.bool) {
        return (
            <SwitchWithLabel
                value={value}
                label={defParam.description}
                callback={(ev) => {
                    updateValues(ev.target.checked);
                }}
            />
        );
    } else if (defParam.type === TYPES.enum) {
        return (
            <DropDown
                value={value}
                label={defParam.description}
                values={defParam.values}
                callback={(ev) => {
                    updateValues(ev.target.value);
                }}
            />
        );
    } else if (defParam.type === TYPES.countries) {
        return (
            <CountrySelector
                value={value || []}
                label={defParam.description}
                callback={(newValues) => {
                    updateValues([...newValues]);
                }}
            />
        );
    } else if (defParam.type === TYPES.double) {
        return (
            <DoubleEditor
                initValue={value}
                label={defParam.description}
                gt={defParam.gt}
                ge={defParam.ge}
                lt={defParam.lt}
                le={defParam.le}
                callback={updateValues}
            />
        );
    }
}

const TYPES = {
    enum: 'Enum',
    bool: 'Bool',
    countries: 'Countries',
    double: 'Double',
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

    return makeComponentsFor(
        defParams,
        lfParams?.commonParameters || {},
        lfParams,
        commitLFParameter
    );
};

const SubgroupParametersButton = ({ showOpenIcon, label, onClick }) => {
    const classes = useStyles();
    return (
        <>
            <Grid item xs={12} className={classes.subgroupParametersButton}>
                <Button
                    startIcon={<SettingsIcon />}
                    endIcon={
                        showOpenIcon ? (
                            <CheckIcon style={{ color: 'green' }} />
                        ) : undefined
                    }
                    onClick={onClick}
                >
                    <FormattedMessage id={label} />
                </Button>
            </Grid>
        </>
    );
};

const AdvancedLoadFlowParameters = ({ lfParams, commitLFParameter }) => {
    const [showAdvancedLfParams, setShowAdvancedLfParams] = useState(false);

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
        useReactiveLimits: {
            type: TYPES.bool,
            description: 'descLfUseReactiveLimits',
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
        dcPowerFactor: {
            type: TYPES.double,
            description: 'descLfDcPowerFactor',
            gt: 0.0, // cosphi in ]0..1]
            le: 1.0,
        },
    };

    return (
        <>
            <SubgroupParametersButton
                showOpenIcon={showAdvancedLfParams}
                label={'showAdvancedParameters'}
                onClick={() => setShowAdvancedLfParams(!showAdvancedLfParams)}
            />
            {showAdvancedLfParams &&
                makeComponentsFor(
                    defParams,
                    lfParams?.commonParameters || {},
                    lfParams,
                    commitLFParameter
                )}
        </>
    );
};

const SpecificLoadFlowParameters = ({
    lfParams,
    specificParamsDescription,
    specificCurrentParams,
    onSpecificParamChange,
}) => {
    const classes = useStyles();
    const [showSpecificLfParams, setShowSpecificLfParams] = useState(false);
    const onChange = (paramName, value, isEdit) => {
        if (isEdit) {
            return;
        }
        const specificParamDescr = Object.values(
            specificParamsDescription
        ).find((descr) => descr.name === paramName);
        onSpecificParamChange(specificParamDescr, value);
    };

    return (
        <>
            <SubgroupParametersButton
                showOpenIcon={showSpecificLfParams}
                label={'showSpecificParameters'}
                onClick={() => setShowSpecificLfParams(!showSpecificLfParams)}
            />
            {showSpecificLfParams && (
                <FlatParameters
                    className={classes.parameterName}
                    paramsAsArray={specificParamsDescription}
                    initValues={flatObject(
                        fusionSpecificWithOtherParams(
                            lfParams,
                            specificCurrentParams
                        )
                    )}
                    onChange={onChange}
                />
            )}
        </>
    );
};

export const LoadFlowParameters = ({ hideParameters, parametersBackend }) => {
    const classes = useStyles();

    const [
        providers,
        provider,
        updateProvider,
        resetProvider,
        params,
        updateParameters,
        resetParameters,
        specificParamsDescriptions,
    ] = parametersBackend;

    const [limitReductionParam, handleChangeLimitReduction] = useParameterState(
        PARAM_LIMIT_REDUCTION
    );

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION = 50;
    const alertThresholdMarks = [
        {
            value: MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION,
            label: MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION.toString(),
        },
        {
            value: 100,
            label: '100',
        },
    ];

    const lfParams = params || [];
    const [specificCurrentParams, setSpecificCurrentParams] = useState(
        lfParams['specificParametersPerProvider']
    );

    const onSpecificParamChange = (specificParamDescr, newValue) => {
        setSpecificCurrentParams((prevCurrentParameters) => {
            return {
                ...prevCurrentParameters,
                [provider]: {
                    ...prevCurrentParameters[provider],
                    [specificParamDescr.name]: newValue,
                },
            };
        });
        const paramsToSend = specificCurrentParams;
        const { [provider]: providerParams, ...otherProvidersSpecificParams } =
            paramsToSend;
        const currentProviderParams = paramsToSend[provider];
        const { [specificParamDescr.name]: value, ...otherProviderParams } =
            currentProviderParams || {};
        //const {[provider]: {[specificParamDescr.name]: value, ...otherProviderParams}, ...otherSpecificParams} = specificCurrentParams
        const commitParameters = lfParams;
        if (specificParamDescr.defaultValue === newValue) {
            const {
                specificParametersPerProvider: allSpecificParameters,
                ...commonParameters
            } = commitParameters;
            updateParameters({
                specificParametersPerProvider: {
                    [provider]: otherProviderParams,
                    ...otherProvidersSpecificParams,
                },
                ...commonParameters,
            });
        } else {
            commitParameters['specificParametersPerProvider'] = {
                ...paramsToSend,
            };
            updateParameters(commitParameters);
        }
    };

    const specificParamsDescrWithoutNanVals = useMemo(() => {
        return replaceAllDefaultValues(
            specificParamsDescriptions[provider],
            'NaN',
            ''
        );
    }, [specificParamsDescriptions, provider]);

    const updateLfProviderCallback = useCallback(
        (evt) => {
            updateProvider(evt.target.value);
        },
        [updateProvider]
    );

    const resetLfParametersAndLfProvider = useCallback(() => {
        setSpecificCurrentParams({});
        resetParameters();
        resetProvider();
    }, [resetParameters, resetProvider]);

    const resetLfParameters = useCallback(() => {
        setSpecificCurrentParams((prevCurrentParameters) => {
            return {
                ...prevCurrentParameters,
                [provider]: {},
            };
        });
        resetParameters();
    }, [resetParameters, provider]);

    // TODO: remove this when DynaFlow will be available not only in developer mode
    useEffect(() => {
        if (provider === 'DynaFlow' && !enableDeveloperMode) {
            resetProvider();
        }
    }, [provider, resetProvider, enableDeveloperMode]);

    // TODO: remove this when DynaFlow will be available not only in developer mode
    const LoadFlowProviders = Object.fromEntries(
        Object.entries(providers).filter(
            ([key]) => !key.includes('DynaFlow') || enableDeveloperMode
        )
    );

    return (
        <>
            <Grid container spacing={1} padding={1}>
                <DropDown
                    value={provider}
                    label="Provider"
                    values={LoadFlowProviders}
                    callback={updateLfProviderCallback}
                />
            </Grid>
            <Grid
                container
                className={classes.scrollableGrid}
                key="lfParameters"
            >
                <LineSeparator />
                <Grid container spacing={1} paddingTop={1}>
                    <LabelledSlider
                        value={Number(limitReductionParam)}
                        label="LimitReduction"
                        onCommitCallback={(event, value) => {
                            handleChangeLimitReduction(value);
                        }}
                        marks={alertThresholdMarks}
                        minValue={MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION}
                    />
                    <LineSeparator />
                </Grid>
                <BasicLoadFlowParameters
                    lfParams={params || {}}
                    commitLFParameter={updateParameters}
                />
                <AdvancedLoadFlowParameters
                    lfParams={params || {}}
                    commitLFParameter={updateParameters}
                />
                {specificParamsDescriptions?.[provider] && (
                    <SpecificLoadFlowParameters
                        lfParams={lfParams}
                        specificParamsDescription={
                            specificParamsDescrWithoutNanVals
                        }
                        specificCurrentParams={specificCurrentParams}
                        onSpecificParamChange={onSpecificParamChange}
                    />
                )}
            </Grid>
            <Grid
                container
                className={classes.controlItem + ' ' + classes.marginTopButton}
                maxWidth="md"
            >
                <LabelledButton
                    callback={resetLfParametersAndLfProvider}
                    label="resetToDefault"
                />
                <LabelledButton
                    callback={resetLfParameters}
                    label="resetProviderValuesToDefault"
                />
                <CloseButton
                    hideParameters={hideParameters}
                    className={classes.button}
                />
            </Grid>
        </>
    );
};
