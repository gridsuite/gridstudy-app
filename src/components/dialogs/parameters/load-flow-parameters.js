/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo, useState } from 'react';
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
import { LabelledSilder, LineSeparator } from '../dialogUtils';
import {
    FlatParameters,
    extractDefaultMap,
    makeDeltaMap,
} from '@gridsuite/commons-ui';
import { LocalizedCountries } from '../../utils/localized-countries-hook';
import { PARAM_LINE_FLOW_ALERT_THRESHOLD } from '../../../utils/config-params';

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
    const [showSpecificLfParams, setShowSpecificLfParams] = useState(false);

    const defaultValues = useMemo(() => {
        return extractDefaultMap(specificParamsDescription);
    }, [specificParamsDescription]);

    const onChange = useCallback(
        (paramName, value, isEdit) => {
            if (isEdit) {
                return;
            }
            const prevCurrentParameters = {
                ...defaultValues,
                ...lfParams?.specificParametersPerProvider?.[currentProvider],
            };
            const nextCurrentParameters = {
                ...prevCurrentParameters,
                ...{ [paramName]: value },
            };
            const deltaMap = makeDeltaMap(defaultValues, nextCurrentParameters);
            const toSend = { ...lfParams };
            const oldSpecifics = toSend['specificParametersPerProvider'];
            toSend['specificParametersPerProvider'] = {
                ...oldSpecifics,
                [currentProvider]: deltaMap ?? {},
            };
            commitLFParameter(toSend);
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
                    initValues={{
                        ...defaultValues,
                        ...lfParams?.specificParametersPerProvider?.[
                            currentProvider
                        ],
                    }}
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

    const [lineFlowAlertThresholdLocal, handleChangeLineFlowAlertThreshold] =
        useParameterState(PARAM_LINE_FLOW_ALERT_THRESHOLD);

    const MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION = 1;
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
                <Grid container spacing={1} paddingTop={1}>
                    <LineSeparator />
                    <LabelledSilder
                        value={Number(lineFlowAlertThresholdLocal)}
                        label="AlertThresholdLabel"
                        onCommitCallback={(event, value) => {
                            handleChangeLineFlowAlertThreshold(value);
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
                        lfParams={params || {}}
                        commitLFParameter={updateParameters}
                        currentProvider={provider}
                        specificParamsDescription={
                            specificParamsDescriptions[provider]
                        }
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
                <CloseButton
                    hideParameters={hideParameters}
                    className={classes.button}
                />
            </Grid>
        </>
    );
};
