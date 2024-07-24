/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    ChangeEvent,
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Grid, TextField, Tooltip } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { styles } from '../parameters.jsx';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/Info';
import {
    isProportionalSAParam,
    PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD,
} from '../../../../utils/config-params.js';
import { inputAdornment } from '../util/make-component-utils.jsx';
import { roundToDefaultPrecision } from '../../../../utils/rounding.js';

const formatValues = (values: Record<string, any>, isDivision: boolean) => {
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

interface FieldToShow {
    label: string;
    firstField: { name: string; label: string };
    secondField?: { name: string; label: string };
    tooltipInfoId: string;
    initValue: Record<string, any>;
    callback: (param: Record<string, any>) => void;
    isSingleField?: boolean;
}

const SecurityAnalysisFields: FunctionComponent<FieldToShow> = ({
    label,
    firstField,
    secondField,
    tooltipInfoId,
    initValue,
    callback,
    isSingleField,
}) => {
    const [values, setValues] = useState<Record<string, any>>(initValue);
    const positiveDoubleValue = useMemo(() => /^\d*[.,]?\d?\d?$/, []);

    useEffect(() => {
        setValues(initValue);
    }, [initValue]);

    const checkValue = useCallback(
        (
            e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            allowedRE: any,
            isPercentage: boolean
        ) => {
            const outputTransformToString = (value: string): any => {
                return value?.replace(',', '.') || '';
            };
            const newValue = outputTransformToString(e.target.value);
            const isValid = allowedRE.exec(newValue);
            const isAllValid = isPercentage
                ? isValid && newValue <= 100
                : isValid;
            if (isAllValid || newValue === '') {
                setValues((prevState) => ({
                    ...prevState,
                    [e.target.name]: outputTransformToString(newValue),
                }));
            }
        },
        []
    );
    const checkPerPercentageValue = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            checkValue(e, positiveDoubleValue, true);
        },
        [checkValue, positiveDoubleValue]
    );
    const checkDoubleValue = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            checkValue(e, positiveDoubleValue, false);
        },
        [checkValue, positiveDoubleValue]
    );

    const formatedValues = useCallback(
        (values: Record<string, any>) => formatValues(values, true),
        []
    );

    const updateValue = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        <Grid sx={isSingleField ? styles.singleItem : styles.multipleItems}>
            <Grid item xs={4} sx={styles.parameterName}>
                <Typography>{label}</Typography>
            </Grid>
            <Grid
                item
                container
                xs={isSingleField ? 8 : 4}
                sx={
                    isSingleField
                        ? styles.singleTextField
                        : styles.firstTextField
                }
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
            {!isSingleField && secondField && (
                <Grid item container xs={4} sx={styles.secondTextField}>
                    <TextField
                        fullWidth
                        sx={{ input: { textAlign: 'right' } }}
                        value={values[secondField.name]}
                        name={secondField.name}
                        onBlur={updateValue}
                        onChange={checkDoubleValue}
                        size="small"
                        InputProps={inputAdornment(secondField?.label)}
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

const ViolationsHidingParameters: FunctionComponent<{
    params: Record<string, any>;
    updateParameters: (value: Record<string, any>) => void;
}> = ({ params, updateParameters }) => {
    const intl = useIntl();

    const callBack = (data: Record<string, any>) => {
        updateParameters({ ...data });
    };

    // create fields with the proper data
    const fieldsToShow: FieldToShow[] = [
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
            <Grid container spacing={1} paddingBottom={1}>
                <Grid item xs={8} sx={styles.text}>
                    <Typography>
                        {intl.formatMessage({
                            id: 'securityAnalysis.violationsHiding',
                        })}
                    </Typography>
                    <Tooltip
                        sx={styles.tooltip}
                        title={
                            <FormattedMessage
                                id={'securityAnalysis.toolTip.violationsHiding'}
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
                    <Grid item xs={16} xl={6.25} key={item.label}>
                        <SecurityAnalysisFields {...item} />
                    </Grid>
                );
            })}
        </>
    );
};

export default ViolationsHidingParameters;
