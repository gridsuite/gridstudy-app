/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Autocomplete, TextField, Chip, Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import { CloseButton, LabelledButton, useStyles } from './parameters';
import { DropDown, SwitchWithLabel } from './parameters';
import { LineSeparator } from '../dialogUtils';
import {
    FlatParameters,
    extractDefaultMap,
    makeDeltaMap,
} from '@gridsuite/commons-ui';

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
            <Grid item xs={6} className={classes.parameterName}>
                <FormattedMessage id={label} />
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
    }
}

const TYPES = {
    enum: 'Enum',
    bool: 'Bool',
    countries: 'Countries',
    string: 'String',
    double: 'Double',
    integer: 'Integer',
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
    commitLFParameter,
    currentProvider,
    specificParamsDescription,
}) => {
    const classes = useStyles();
    const [currentParameters, setCurrentParameters] = useState(null);
    const [showSpecificLfParams, setShowSpecificLfParams] = useState(false);

    const defaultValues = useMemo(() => {
        return extractDefaultMap(specificParamsDescription);
    }, [specificParamsDescription]);

    const lfParamsRef = useRef();
    lfParamsRef.current =
        lfParams?.specificParametersPerProvider?.[currentProvider];

    // When provider changes or defaultValues then we must reset currentParameters state
    useEffect(() => {
        setCurrentParameters({
            ...defaultValues,
            ...lfParamsRef.current,
        });
    }, [currentProvider, defaultValues]);

    const onChange = useCallback(
        (paramName, value, isEdit) => {
            if (isEdit) {
                return;
            }
            setCurrentParameters((prevCurrentParameters) => {
                const nextCurrentParameters = {
                    ...prevCurrentParameters,
                    ...{ [paramName]: value },
                };
                const deltaMap = makeDeltaMap(
                    defaultValues,
                    nextCurrentParameters
                );
                const toSend = { ...lfParams };
                const oldSpecifics = toSend['specificParametersPerProvider'];
                toSend['specificParametersPerProvider'] = {
                    ...oldSpecifics,
                    [currentProvider]: deltaMap ?? {},
                };
                commitLFParameter(toSend);
                return nextCurrentParameters;
            });
        },
        [commitLFParameter, currentProvider, defaultValues, lfParams]
    );

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
                    initValues={currentParameters}
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
        <>
            <Grid
                container
                className={classes.scrollableGrid}
                key="lfParameters"
            >
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
                />
                <SpecificLoadFlowParameters
                    lfParams={params || {}}
                    commitLFParameter={updateParameters}
                    currentProvider={provider}
                    specificParamsDescription={
                        specificParamsDescriptions[provider]
                    }
                />
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
                <CloseButton
                    hideParameters={hideParameters}
                    className={classes.button}
                />
            </Grid>
        </>
    );
};
