/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ChangeEvent,
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { parameterStyles } from '../parameters-style';
import { Grid, TextField, Tooltip, Typography } from '@mui/material';
import { inputAdornment } from '../util/make-component-utils';
import { FormattedMessage } from 'react-intl';
import InfoIcon from '@mui/icons-material/Info';

export const formatValues = (
    values: Record<string, number | string>,
    isDivision: boolean
) => {
    let result: Record<string, number | string> = {};
    if (!values) {
        return result;
    }
    Object.entries(values)?.forEach(([key, value]) => {
        result = {
            ...result,
            [key]: isProportionalSAParam(key)
                ? roundToDefaultPrecision(
                      isDivision ? Number(value) / 100 : Number(value) * 100
                  )
                : value,
        };
    });
    return result;
};

interface FieldProps {
    name: string;
    label: string;
}

interface SecurityAnalysisFieldsProps {
    label: string;
    firstField: FieldProps;
    secondField?: FieldProps;
    tooltipInfoId: string;
    initValue: Record<string, number | string>;
    callback: (values: any) => void;
    isSingleField?: boolean;
}

export const SecurityAnalysisFields: FunctionComponent<
    SecurityAnalysisFieldsProps
> = ({
    label,
    firstField,
    secondField,
    tooltipInfoId,
    initValue,
    callback,
    isSingleField,
}) => {
    const [values, setValues] = useState(initValue);
    const positiveDoubleValue = useMemo(() => /^\d*[.,]?\d?\d?$/, []);

    useEffect(() => {
        setValues(initValue);
    }, [initValue]);

    const checkValue = useCallback(
        (
            e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            allowedRE: RegExp,
            isPercentage: boolean
        ) => {
            const outputTransformToString = (value: string) => {
                return value?.replace(',', '.') || '';
            };
            const newValue = outputTransformToString(e.target.value);
            const isValid = allowedRE.exec(newValue);
            const isAllValid = isPercentage
                ? isValid && Number(newValue) <= 100
                : isValid;
            if (isAllValid || newValue === '') {
                setValues((prevState) => ({
                    ...prevState,
                    [e.target.name]: newValue,
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
        (values: Record<string, number | string>) => formatValues(values, true),
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
        <Grid
            sx={
                isSingleField
                    ? parameterStyles.singleItem
                    : parameterStyles.multipleItems
            }
        >
            <Grid item xs={4} sx={parameterStyles.parameterName}>
                <Typography>{label}</Typography>
            </Grid>
            <Grid
                item
                container
                xs={isSingleField ? 8 : 4}
                sx={
                    isSingleField
                        ? parameterStyles.singleTextField
                        : parameterStyles.firstTextField
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
                <Grid
                    item
                    container
                    xs={4}
                    sx={parameterStyles.secondTextField}
                >
                    <TextField
                        fullWidth
                        sx={{ input: { textAlign: 'right' } }}
                        value={values[secondField.name]}
                        name={secondField?.name}
                        onBlur={updateValue}
                        onChange={checkDoubleValue}
                        size="small"
                        InputProps={inputAdornment(secondField.label)}
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
