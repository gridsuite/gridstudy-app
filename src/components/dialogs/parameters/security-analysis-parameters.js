/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid, TextField, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { CloseButton, DropDown, LabelledButton, useStyles } from './parameters';
import { LineSeparator } from '../dialogUtils';
import Typography from '@mui/material/Typography';
import {
    isProportionalSAParam,
    PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD,
} from '../../../utils/config-params';
import { roundToDefaultPrecision } from '../../../utils/rounding';

import { FormattedMessage, useIntl } from 'react-intl';
import { inputAdornment } from './util/make-component-utils';

const formatValues = (values, isDivision) => {
    let result = {};
    if (!values) {
        return result;
    }
    Object.entries(values)?.forEach(([key, value]) => {
        result = {
            ...result,
            [key]: isProportionalSAParam(key)
                ? roundToDefaultPrecision(
                      isDivision ? value / 100 : value * 100
                  )
                : value,
        };
    });
    return result;
};

const SecurityAnalysisFields = ({
    label,
    firstField,
    secondField,
    tooltipInfoId,
    initValue,
    callback,
    isSingleField,
}) => {
    const classes = useStyles();
    const [values, setValues] = useState(initValue);
    const positiveDoubleValue = useMemo(() => /^\d*[.,]?\d?\d?$/, []);

    useEffect(() => {
        setValues(initValue);
    }, [initValue]);

    const checkValue = useCallback((e, allowedRE, isPercentage) => {
        const outputTransformToString = (value) => {
            return value?.replace(',', '.') || '';
        };
        const newValue = outputTransformToString(e.target.value);
        const isValid = allowedRE.exec(newValue);
        const isAllValid = isPercentage ? isValid && newValue <= 100 : isValid;
        if (isAllValid || newValue === '') {
            setValues((prevState) => ({
                ...prevState,
                [e.target.name]: outputTransformToString(newValue),
            }));
        }
    }, []);
    const checkPerPercentageValue = useCallback(
        (e) => {
            checkValue(e, positiveDoubleValue, true);
        },
        [checkValue, positiveDoubleValue]
    );
    const checkDoubleValue = useCallback(
        (e) => {
            checkValue(e, positiveDoubleValue, false);
        },
        [checkValue, positiveDoubleValue]
    );

    const formatedValues = useCallback(
        (values) => formatValues(values, true),
        []
    );

    const updateValue = useCallback(
        (e) => {
            const name = e.target.name;
            const value = e.target.value;
            // if the field is left empty then show the initial value.
            if (value === '') {
                setValues((prevState) => ({
                    ...prevState,
                    [e.target.name]: initValue[name],
                }));
            } else if (initValue[name] !== value) {
                const f = parseFloat(value);
                if (!isNaN(f)) {
                    callback(formatedValues(values));
                }
            }
        },
        [initValue, callback, values, formatedValues]
    );

    return (
        <Grid
            className={
                isSingleField ? classes.singleItem : classes.multipleItems
            }
        >
            <Grid item xs={4} className={classes.parameterName}>
                <Typography>{label}</Typography>
            </Grid>
            {!isSingleField && (
                <>
                    <Grid
                        item
                        container
                        xs={4}
                        className={classes.firstTextField}
                    >
                        <TextField
                            fullWidth
                            sx={{ input: { textAlign: 'right' } }}
                            value={values[firstField?.name]}
                            name={firstField?.name}
                            onBlur={updateValue}
                            onChange={checkPerPercentageValue}
                            size="small"
                            InputProps={inputAdornment(firstField?.label)}
                        />
                    </Grid>
                    <Grid
                        item
                        container
                        xs={4}
                        className={classes.secondTextField}
                    >
                        <TextField
                            fullWidth
                            sx={{ input: { textAlign: 'right' } }}
                            value={values[secondField?.name]}
                            name={secondField?.name}
                            onBlur={updateValue}
                            onChange={checkDoubleValue}
                            size="small"
                            InputProps={inputAdornment(secondField?.label)}
                        />
                    </Grid>
                </>
            )}
            {isSingleField && (
                <Grid item container xs={8} className={classes.singleTextField}>
                    <TextField
                        fullWidth
                        sx={{ input: { textAlign: 'right' } }}
                        value={values[firstField?.name]}
                        name={firstField?.name}
                        onBlur={updateValue}
                        onChange={checkPerPercentageValue}
                        size="small"
                        InputProps={inputAdornment(firstField?.label)}
                    />
                </Grid>
            )}
            <Tooltip
                title={<FormattedMessage id={tooltipInfoId} />}
                placement="left-start"
            >
                <InfoIcon />
            </Tooltip>
        </Grid>
    );
};

export const SecurityAnalysisParameters = ({
    hideParameters,
    parametersBackend,
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

    const handleUpdateProvider = (evt) => updateProvider(evt.target.value);

    const updateProviderCallback = useCallback(handleUpdateProvider, [
        updateProvider,
    ]);
    const intl = useIntl();

    const callBack = (data) => {
        updateParameters({ ...data });
    };

    // TODO: remove this when DynaFlow is supported
    // DynaFlow is not supported at the moment for security analysis
    const securityAnalysisProvider = Object.fromEntries(
        Object.entries(providers).filter(([key]) => !key.includes('DynaFlow'))
    );

    const resetSAParametersAndProvider = useCallback(() => {
        resetParameters();
        resetProvider();
    }, [resetParameters, resetProvider]);

    const resetSAParameters = useCallback(() => {
        resetParameters();
    }, [resetParameters]);

    // create fields with the proper data
    const fieldsToShow = [
        {
            label: intl.formatMessage({
                id: 'securityAnalysis.current',
            }),
            firstField: {
                name: PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD,
                label: '%',
            },
            tooltipInfoId: 'securityAnalysis.toolTip.current',
            initValue: formatValues(params, false),
            callback: callBack,
            isSingleField: true,
        },
        {
            label: intl.formatMessage({
                id: 'securityAnalysis.lowVoltage',
            }),
            firstField: {
                name: PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD,
                label: '%',
            },
            secondField: {
                label: 'kV',
                name: PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD,
            },
            tooltipInfoId: 'securityAnalysis.toolTip.lowVoltage',
            initValue: formatValues(params, false),
            callback: callBack,
        },
        {
            label: intl.formatMessage({
                id: 'securityAnalysis.highVoltage',
            }),
            firstField: {
                name: PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD,
                label: '%',
            },
            secondField: {
                label: 'kV',
                name: PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD,
            },
            tooltipInfoId: 'securityAnalysis.toolTip.highVoltage',
            initValue: formatValues(params, false),
            callback: callBack,
        },
    ];

    return (
        <>
            <Grid container spacing={1} padding={1}>
                <DropDown
                    value={provider}
                    label="Provider"
                    values={securityAnalysisProvider}
                    callback={updateProviderCallback}
                />

                <Grid container spacing={1} paddingBottom={1}>
                    <Grid item xs={8} className={classes.text}>
                        <Typography>
                            {intl.formatMessage({
                                id: 'securityAnalysis.violationsHiding',
                            })}
                        </Typography>
                        <Tooltip
                            className={classes.tooltip}
                            title={
                                <FormattedMessage
                                    id={
                                        'securityAnalysis.toolTip.violationsHiding'
                                    }
                                />
                            }
                            placement="left-start"
                        >
                            <InfoIcon />
                        </Tooltip>
                    </Grid>
                </Grid>

                {fieldsToShow?.map((item) => {
                    return (
                        <SecurityAnalysisFields key={item.label} {...item} />
                    );
                })}
            </Grid>
            <Grid
                container
                key="secuAnalysisProvider"
                className={classes.scrollableGrid}
                spacing={1}
            ></Grid>
            <LineSeparator />
            <Grid
                container
                className={classes.controlItem + ' ' + classes.marginTopButton}
                maxWidth="md"
            >
                <LabelledButton
                    callback={resetSAParametersAndProvider}
                    label="resetToDefault"
                />
                <LabelledButton
                    label="resetProviderValuesToDefault"
                    callback={resetSAParameters}
                />
                <CloseButton
                    hideParameters={hideParameters}
                    className={classes.button}
                />
            </Grid>
        </>
    );
};
