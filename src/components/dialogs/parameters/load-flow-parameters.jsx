/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    DirectoryItemSelector,
    ElementType,
    FlatParameters,
    SubmitButton,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { Autocomplete, Box, Chip, Grid, Tab, Tabs, TextField } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { fetchLoadFlowParameters } from '../../../services/loadflow';
import { PARAM_DEVELOPER_MODE, PARAM_LIMIT_REDUCTION } from '../../../utils/config-params';
import { mergeSx } from '../../utils/functions';
import { useLocalizedCountries } from '../../utils/localized-countries-hook';
import { replaceAllDefaultValues } from '../../utils/utils';
import { LineSeparator } from '../dialogUtils';
import CreateParameterDialog from './common/parameters-creation-dialog';
import { useParameterState } from './hooks';
import { ParameterGroup } from './widget';
import ParameterLineSlider from './widget/parameter-line-slider';
import {
    IST_FORM,
    LIMIT_DURATION_FORM,
    LIMIT_REDUCTIONS_FORM,
    TAB_INFO,
    TAB_VALUES,
    getLimitReductionsFormSchema,
} from './common/limitreductions/columns-definitions';
import LimitReductionsTableForm from './common/limitreductions/limit-reductions-table-form';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toFormValuesLimitReductions } from './common/limitreductions/limit-reductions-form-util';
import LabelledButton from './widget/labelled-button';
import SwitchWithLabel from './widget/switch-with-label';
import DropDown from './widget/drop-down';
import TabPanel from './widget/tab-panel';

const styles = {
    minWidthMedium: (theme) => ({
        minWidth: theme.spacing(20),
    }),
};

const CountrySelector = ({ value, label, callback }) => {
    const { translate, countryCodes } = useLocalizedCountries();

    return (
        <>
            <Grid item xs={6} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={6} sx={styles.controlItem}>
                <Autocomplete
                    size="small"
                    value={value}
                    multiple
                    onChange={(event, newValues) => callback(newValues)}
                    options={countryCodes}
                    getOptionLabel={(countryCode) => translate(countryCode)}
                    renderInput={(props) => (
                        <TextField
                            label={
                                <FormattedMessage id={value?.length === 0 ? 'descLfAllCountries' : 'descLfCountries'} />
                            }
                            sx={styles.minWidthMedium}
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

export const DoubleEditor = ({
    initValue,
    label,
    callback,
    checkIsTwoDigitAfterDecimal = false,
    ge = undefined,
    gt = undefined,
    le = undefined,
    lt = undefined,
}) => {
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
            const FloatRE = checkIsTwoDigitAfterDecimal ? /^(\d*\.{0,1}\d{0,2}$)/ : /^-?\d*[.,]?\d*$/;
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
        [checkIsTwoDigitAfterDecimal, ge, gt, le, lt]
    );

    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
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

function makeComponentsFor(defParams, localParams, allParams, setter, provider) {
    return Object.keys(defParams).map((key) => (
        <Grid container spacing={1} paddingTop={1} key={key} justifyContent={'space-between'}>
            {makeComponentFor(defParams[key], key, localParams, allParams, setter, provider)}
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

function makeComponentFor(defParam, key, localParams, allParams, setter, provider) {
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

    return makeComponentsFor(defParams, lfParams?.commonParameters || {}, lfParams, commitLFParameter);
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
        <ParameterGroup label={'showAdvancedParameters'} state={showAdvancedLfParams} onClick={setShowAdvancedLfParams}>
            {makeComponentsFor(defParams, lfParams?.commonParameters || {}, lfParams, commitLFParameter)}
        </ParameterGroup>
    );
};

const SpecificLoadFlowParameters = ({
    disabled,
    subText,
    specificParamsDescription,
    specificCurrentParams,
    onSpecificParamChange,
}) => {
    const [showSpecificLfParams, setShowSpecificLfParams] = useState(false);
    const onChange = (paramName, value, isEdit) => {
        if (isEdit) {
            return;
        }
        onSpecificParamChange(paramName, value);
    };

    return (
        <ParameterGroup
            state={showSpecificLfParams}
            label={'showSpecificParameters'}
            onClick={setShowSpecificLfParams}
            unmountOnExit={false}
            disabled={disabled}
            infoText={subText}
        >
            <FlatParameters
                sx={styles.parameterName}
                paramsAsArray={specificParamsDescription ?? []}
                initValues={specificCurrentParams}
                onChange={onChange}
            />
        </ParameterGroup>
    );
};

export const LoadFlowParameters = ({ parametersBackend, setHaveDirtyFields }) => {
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

    const [openCreateParameterDialog, setOpenCreateParameterDialog] = useState(false);
    const [openSelectParameterDialog, setOpenSelectParameterDialog] = useState(false);
    const { snackError } = useSnackMessage();
    const intl = useIntl();

    const onSpecificParamChange = (paramName, newValue) => {
        const specificParamDescr = Object.values(specificParamsDescrWithoutNanVals[provider]).find(
            (descr) => descr.name === paramName
        );

        let specParamsToSave;
        if (specificParamDescr.defaultValue !== newValue) {
            specParamsToSave = {
                ...params.specificParametersPerProvider,
                [provider]: {
                    ...params.specificParametersPerProvider[provider],
                    [specificParamDescr.name]: newValue,
                },
            };
        } else {
            const { [specificParamDescr.name]: value, ...otherProviderParams } =
                params.specificParametersPerProvider[provider] || {};
            specParamsToSave = {
                ...params.specificParametersPerProvider,
                [provider]: otherProviderParams,
            };
        }

        updateParameters(fusionSpecificWithOtherParams(params, specParamsToSave));
    };

    const specificParamsDescrWithoutNanVals = useMemo(() => {
        let specificParamsDescrCopy = {};
        specificParamsDescriptions &&
            Object.entries(specificParamsDescriptions).forEach(([k, v]) => {
                specificParamsDescrCopy = {
                    ...specificParamsDescrCopy,
                    [k]: replaceAllDefaultValues(v, 'NaN', ''),
                };
            });
        return specificParamsDescrCopy;
    }, [specificParamsDescriptions]);

    const updateLfProviderCallback = useCallback(
        (evt) => {
            updateProvider(evt.target.value);
        },
        [updateProvider]
    );

    const resetLfParametersAndLfProvider = useCallback(() => {
        resetParameters().then(resetProvider);
    }, [resetParameters, resetProvider]);

    // TODO: remove this when DynaFlow will be available not only in developer mode
    useEffect(() => {
        if (provider === 'DynaFlow' && !enableDeveloperMode) {
            resetProvider();
        }
    }, [provider, resetProvider, enableDeveloperMode]);

    // TODO: remove this when DynaFlow will be available not only in developer mode
    const LoadFlowProviders = Object.fromEntries(
        Object.entries(providers).filter(([key]) => !key.includes('DynaFlow') || enableDeveloperMode)
    );
    const handleLoadParameter = useCallback(
        (newParams) => {
            if (newParams && newParams.length > 0) {
                setOpenSelectParameterDialog(false);
                fetchLoadFlowParameters(newParams[0].id)
                    .then((parameters) => {
                        console.info('loading the following loadflow parameters : ' + parameters.uuid);
                        const provider = parameters['provider'];
                        const specParamsToSave = {
                            [provider]: parameters?.specificParametersPerProvider[provider],
                        };
                        const commitParameters = fusionSpecificWithOtherParams(parameters, specParamsToSave);
                        updateParameters(commitParameters);
                    })
                    .catch((error) => {
                        console.error(error);
                        snackError({
                            messageTxt: error.message,
                            headerId: 'paramsRetrievingError',
                        });
                    });
            }
            setOpenSelectParameterDialog(false);
        },
        [snackError, updateParameters]
    );
    const formatNewParams = useCallback((newParams) => {
        const speceficParameters =
            'specificParametersPerProvider' in newParams ? newParams['specificParametersPerProvider'] : {};

        return {
            ...newParams,
            specificParametersPerProvider: speceficParameters,
        };
    }, []);

    const [tabValue, setTabValue] = useState(TAB_VALUES.General);
    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);
    }, []);

    const formSchema = useMemo(() => {
        return getLimitReductionsFormSchema(
            params.limitReductions ? params.limitReductions[0].temporaryLimitReductions.length : 0
        );
    }, [params]);

    const formMethods = useForm({
        defaultValues: { [LIMIT_REDUCTIONS_FORM]: [] },
        resolver: yupResolver(formSchema),
    });

    const toLimitReductions = useCallback(
        (formLimits) => {
            return params.limitReductions.map((vlLimits, indexVl) => {
                let vlLNewLimits = {
                    ...vlLimits,
                    permanentLimitReduction: formLimits[indexVl][IST_FORM],
                };
                vlLimits.temporaryLimitReductions.forEach((temporaryLimit, index) => {
                    vlLNewLimits.temporaryLimitReductions[index] = {
                        ...temporaryLimit,
                        reduction: formLimits[indexVl][LIMIT_DURATION_FORM + index],
                    };
                });
                return vlLNewLimits;
            });
        },
        [params]
    );

    const { handleSubmit, formState } = formMethods;

    const updateLimitReductions = useCallback(
        (formLimits) => {
            updateParameters({
                ...params,
                limitReductions: toLimitReductions(formLimits[LIMIT_REDUCTIONS_FORM]),
            });
        },
        [params, updateParameters, toLimitReductions]
    );

    const { reset } = formMethods;
    useEffect(() => {
        reset(toFormValuesLimitReductions(params.limitReductions));
    }, [params.limitReductions, reset]);

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    // we must keep the line of the simulator selection visible during scrolling
    // only specifics parameters are dependents of simulator type
    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <Grid item sx={{ height: '100%' }} xl={9} lg={11} md={12}>
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        position: 'relative',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{ flexGrow: 0, paddingLeft: 1, paddingTop: 1 }}>
                        <Grid
                            container
                            spacing={1}
                            sx={{
                                paddingLeft: 0,
                                paddingRight: 2,
                                height: 'fit-content',
                            }}
                            justifyContent={'space-between'}
                        >
                            <DropDown
                                value={provider}
                                label="Provider"
                                values={LoadFlowProviders}
                                callback={updateLfProviderCallback}
                            />
                            <LineSeparator />
                        </Grid>
                    </Box>
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflow: 'auto',
                            paddingLeft: 1,
                        }}
                    >
                        <Grid
                            container
                            sx={mergeSx(styles.scrollableGrid, {
                                maxHeight: '100%',
                            })}
                            key="lfParameters"
                        >
                            <Grid sx={{ width: '100%' }}>
                                <Tabs value={tabValue} onChange={handleTabChange}>
                                    {TAB_INFO.filter((t) => enableDeveloperMode || !t.developerModeOnly).map(
                                        (tab, index) => (
                                            <Tab
                                                key={tab.label}
                                                label={<FormattedMessage id={tab.label} />}
                                                value={index}
                                                sx={{
                                                    fontSize: 17,
                                                    fontWeight: 'bold',
                                                    textTransform: 'capitalize',
                                                }}
                                            />
                                        )
                                    )}
                                </Tabs>

                                {TAB_INFO.filter((t) => enableDeveloperMode || !t.developerModeOnly).map(
                                    (tab, index) => (
                                        <TabPanel key={tab.label} value={tabValue} index={index}>
                                            {tabValue === TAB_VALUES.General && (
                                                <>
                                                    <BasicLoadFlowParameters
                                                        lfParams={params || {}}
                                                        commitLFParameter={updateParameters}
                                                    />
                                                    <AdvancedLoadFlowParameters
                                                        lfParams={params || {}}
                                                        commitLFParameter={updateParameters}
                                                    />
                                                    <SpecificLoadFlowParameters
                                                        disabled={!specificParamsDescriptions?.[provider]}
                                                        subText={provider}
                                                        specificParamsDescription={
                                                            specificParamsDescrWithoutNanVals[provider]
                                                        }
                                                        specificCurrentParams={
                                                            params.specificParametersPerProvider[provider] || {}
                                                        }
                                                        onSpecificParamChange={onSpecificParamChange}
                                                    />
                                                </>
                                            )}
                                            {tabValue === TAB_VALUES.LimitReductions && (
                                                <Grid
                                                    container
                                                    sx={mergeSx(styles.scrollableGrid, {
                                                        maxHeight: '100%',
                                                    })}
                                                    key="lfParameters"
                                                >
                                                    <Grid
                                                        container
                                                        spacing={1}
                                                        paddingTop={1}
                                                        paddingLeft={2}
                                                        sx={{ width: '100%' }}
                                                    >
                                                        {params.limitReductions !== null ? (
                                                            <LimitReductionsTableForm limits={params.limitReductions} />
                                                        ) : (
                                                            <ParameterLineSlider
                                                                paramNameId={PARAM_LIMIT_REDUCTION}
                                                                label="LimitReduction"
                                                                marks={alertThresholdMarks}
                                                                minValue={MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION}
                                                            />
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            )}
                                        </TabPanel>
                                    )
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <LineSeparator />
                        <Grid
                            container
                            item
                            sx={mergeSx(styles.controlParametersItem, styles.marginTopButton, { paddingBottom: 0 })}
                        >
                            <LabelledButton
                                callback={() => setOpenSelectParameterDialog(true)}
                                label="settings.button.chooseSettings"
                            />
                            <LabelledButton callback={() => setOpenCreateParameterDialog(true)} label="save" />
                            <LabelledButton callback={resetLfParametersAndLfProvider} label="resetToDefault" />
                            <LabelledButton callback={resetParameters} label="resetProviderValuesToDefault" />
                            <SubmitButton onClick={handleSubmit(updateLimitReductions)} variant="outlined">
                                <FormattedMessage id="validate" />
                            </SubmitButton>
                        </Grid>
                    </Box>
                    {openCreateParameterDialog && (
                        <CreateParameterDialog
                            open={openCreateParameterDialog}
                            onClose={() => setOpenCreateParameterDialog(false)}
                            parameterValues={() => formatNewParams(params)}
                            parameterFormatter={(newParams) => newParams}
                            parameterType={ElementType.LOADFLOW_PARAMETERS}
                        />
                    )}
                    {openSelectParameterDialog && (
                        <DirectoryItemSelector
                            open={openSelectParameterDialog}
                            onClose={handleLoadParameter}
                            types={[ElementType.LOADFLOW_PARAMETERS]}
                            title={intl.formatMessage({
                                id: 'showSelectParameterDialog',
                            })}
                            onlyLeaves={true}
                            multiselect={false}
                            validationButtonText={intl.formatMessage({
                                id: 'validate',
                            })}
                        />
                    )}
                </Box>
            </Grid>
        </CustomFormProvider>
    );
};
