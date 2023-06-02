/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Grid, TextField, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { CloseButton, DropDown, LabelledButton, useStyles } from './parameters';
import { LineSeparator } from '../dialogUtils';
import Typography from '@mui/material/Typography';
import {
    PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD,
} from '../../../utils/config-params';
import { useIntl } from 'react-intl';

const SecurityAnalysisFields = ({
    label,
    firstField,
    secondField,
    tooltipInfo,
    initValue,
    callback,
    isSingleField,
}) => {
    const classes = useStyles();
    const [values, setValues] = useState(initValue);

    useEffect(() => {
        setValues(initValue);
    }, [initValue]);

    const checkValue = useCallback((e, allowedRE, isPercentage) => {
        const outputTransformToString = (value) => {
            return value?.replace(',', '.') || '';
        };
        const newValue = e.target.value;
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
            const percentageRE = /^\d*[.,]?\d?\d?$/;
            checkValue(e, percentageRE, true);
        },
        [checkValue]
    );
    const checkDoubleValue = useCallback(
        (e) => {
            const doubleRE = /^\d*[.,]?\d?\d?$/;
            checkValue(e, doubleRE);
        },
        [checkValue]
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
                    callback(values);
                }
            }
        },
        [initValue, callback, values]
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
                            label={firstField?.label}
                            name={firstField?.name}
                            onBlur={updateValue}
                            onChange={checkPerPercentageValue}
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
                            label={secondField?.label}
                            name={secondField?.name}
                            onBlur={updateValue}
                            onChange={checkDoubleValue}
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
                        label={firstField?.label}
                        onBlur={updateValue}
                        onChange={checkPerPercentageValue}
                    />
                </Grid>
            )}
            <Tooltip
                title={
                    <div dangerouslySetInnerHTML={{ __html: tooltipInfo }} />
                }
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
    const securityAnalysisiProvider = Object.fromEntries(
        Object.entries(providers).filter(([key]) => !key.includes('DynaFlow'))
    );

    const resetSAParametersAndProvider = useCallback(() => {
        resetParameters();
        resetProvider();
    }, [resetParameters, resetProvider]);

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
            tooltipInfo: intl.formatMessage({
                id: 'securityAnalysis.toolTip',
            }),
            initValue: params,
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
                label: 'kv',
                name: PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD,
            },
            tooltipInfo: intl.formatMessage({
                id: 'securityAnalysis.toolTip',
            }),
            initValue: params,
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
                label: 'kv',
                name: PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD,
            },
            tooltipInfo: intl.formatMessage({
                id: 'securityAnalysis.toolTip',
            }),
            initValue: params,
            callback: callBack,
        },
    ];

    return (
        <>
            <Grid
                container
                key="secuAnalysisProvider"
                className={classes.scrollableGrid}
                spacing={1}
            >
                <DropDown
                    value={provider}
                    label="Provider"
                    values={securityAnalysisiProvider}
                    callback={updateProviderCallback}
                />

                <Grid className={classes.textContainer}>
                    <Grid item xs={8} className={classes.text}>
                        <Typography>
                            {intl.formatMessage({
                                id: 'securityAnalysis.violationsHiding',
                            })}
                        </Typography>
                        <Tooltip
                            className={classes.tooltip}
                            title={
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: intl.formatMessage({
                                            id: 'securityAnalysis.toolTip',
                                        }),
                                    }}
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
                <CloseButton
                    hideParameters={hideParameters}
                    className={classes.button}
                />
            </Grid>
        </>
    );
};
