/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    useCallback,
    useState,
    forwardRef,
    useImperativeHandle,
    useEffect,
} from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Autocomplete, TextField, Tooltip } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { EDIT_COLUMN } from './config-tables';
import { LocalizedCountries } from 'components/utils/localized-countries-hook';
const refreshEditingCell = (gridApi) => {
    const rowNode = gridApi.getPinnedTopRow(0);
    if (rowNode) {
        const refreshConfig = {
            rowNodes: [rowNode],
            columns: [EDIT_COLUMN],
            force: true,
        };
        gridApi.getCellEditorInstances().forEach((cellEditor) => {
            if (cellEditor.refreshValidation) {
                cellEditor.refreshValidation();
            }
        });
        gridApi.refreshCells(refreshConfig);
    }
};

const checkCrossValidationRequiredOn = (gridApi, colDef) => {
    const dependencyEditor = gridApi
        .getCellEditorInstances()
        .filter((editor) =>
            typeof editor.getField !== 'undefined'
                ? editor.getField() ===
                  colDef.crossValidation.requiredOn.dependencyColumn
                : undefined
        );
    if (!dependencyEditor.length) {
        return false;
    }
    if ('columnValue' in colDef.crossValidation.requiredOn) {
        // if the prop columnValue exist, then we compare its value with the current value
        return (
            dependencyEditor[0].getValue() !==
            colDef.crossValidation.requiredOn.columnValue
        );
    } else {
        // otherwise, we just check if there is a current value
        return dependencyEditor[0].getValue() === undefined;
    }
};

export const NumericalField = forwardRef(
    (
        {
            defaultValue,
            optional,
            minExpression,
            maxExpression,
            gridContext,
            colDef,
            gridApi,
            allowZero = false,
        },
        ref
    ) => {
        const [error, setError] = useState(false);
        const intl = useIntl();

        //minExpression and maxExpression are either a reference to a variable or a static number
        const getMin = useCallback(() => {
            if (!isNaN(minExpression)) {
                return minExpression;
            }
            return gridContext.dynamicValidation[minExpression];
        }, [minExpression, gridContext.dynamicValidation]);

        const getMax = useCallback(() => {
            if (!isNaN(maxExpression)) {
                return maxExpression;
            }
            return gridContext.dynamicValidation[maxExpression];
        }, [maxExpression, gridContext.dynamicValidation]);

        const [minValue, setMinValue] = useState(getMin());
        const [maxValue, setMaxValue] = useState(getMax());
        const [value, setValue] = useState(defaultValue);

        useEffect(() => {
            refreshEditingCell(gridApi);
        }, [gridApi, value]);

        const isValid = useCallback(
            (val, minVal, maxVal, allowZero) => {
                if (val === undefined || val === null) {
                    if (optional) {
                        return true;
                    }
                    if (colDef.crossValidation?.requiredOn) {
                        const isConditionFulfiled =
                            checkCrossValidationRequiredOn(gridApi, colDef);
                        if (isConditionFulfiled) {
                            return true;
                        }
                    }
                    return false;
                }
                if (allowZero && val === 0) {
                    return true;
                }
                return (
                    (minVal === undefined || val >= minVal) &&
                    (maxVal === undefined || val <= maxVal)
                );
            },
            [optional, colDef, gridApi]
        );

        const validateChange = useCallback(() => {
            // the local state is not always up to date, for instance when we call setMinValue and setMaxValue right before this callback
            const minValue = getMin();
            const maxValue = getMax();
            const updatedErrors = { ...gridContext.editErrors };
            if (isValid(value, minValue, maxValue, allowZero)) {
                setError(false);
                delete updatedErrors[colDef.field];
                gridContext.editErrors = updatedErrors;
            } else {
                setError(true);
                updatedErrors[colDef.field] = true;
                gridContext.editErrors = updatedErrors;
            }
        }, [
            colDef.field,
            gridContext,
            getMin,
            getMax,
            value,
            isValid,
            allowZero,
        ]);

        useImperativeHandle(
            ref,
            () => {
                return {
                    getValue: () => {
                        return value;
                    },
                    getField: () => {
                        return colDef.field;
                    },
                    refreshValidation: () => {
                        setMaxValue(getMax());
                        setMinValue(getMin());
                        validateChange();
                    },
                };
            },
            [getMax, getMin, colDef.field, validateChange, value]
        );

        const validateEvent = useCallback(
            (ev) => {
                let newVal = parseFloat(ev.target.value);
                if (isNaN(newVal)) {
                    newVal = undefined;
                }
                setValue(newVal);
                gridContext.dynamicValidation[colDef.field] = newVal;
            },
            [colDef.field, gridContext.dynamicValidation]
        );

        function renderNumericText() {
            return (
                <TextField
                    value={value}
                    onChange={validateEvent}
                    error={error}
                    type={'number'}
                    size={'small'}
                    margin={'none'}
                    inputProps={{
                        style: {
                            textAlign: 'center',
                            fontSize: 'small',
                        },
                        min: { minValue },
                        max: { maxValue },
                        step: 'any',
                        lang: 'en-US', // to have . as decimal separator
                    }}
                />
            );
        }

        function renderNumericTextWithTooltip() {
            let tooltip = '';
            if (minValue !== undefined && maxValue !== undefined) {
                tooltip = intl.formatMessage(
                    { id: 'MinMax' },
                    { min: minValue, max: maxValue }
                );
            } else if (minValue !== undefined) {
                tooltip = intl.formatMessage(
                    { id: 'OnlyMin' },
                    { min: minValue }
                );
            } else if (maxValue !== undefined) {
                tooltip = intl.formatMessage(
                    { id: 'OnlyMax' },
                    { max: maxValue }
                );
            }
            if (tooltip !== '') {
                return <Tooltip title={tooltip}>{renderNumericText()}</Tooltip>;
            }
            return renderNumericText();
        }

        return (
            <div style={{ width: 'inherit' }}>
                {renderNumericTextWithTooltip()}
            </div>
        );
    }
);

export const BooleanListField = forwardRef(
    ({ defaultValue, gridContext, colDef, gridApi }, ref) => {
        const intl = useIntl();
        const [value, setValue] = useState(defaultValue);

        useImperativeHandle(
            ref,
            () => {
                return {
                    getValue: () => {
                        return value;
                    },
                    getField: () => {
                        return colDef.field;
                    },
                };
            },
            [colDef.field, value]
        );

        const validateChange = useCallback(
            (ev) => {
                const val = ev.target.value;
                setValue(val);
                if (colDef.resetColumnsInError) {
                    const updatedErrors = { ...gridContext.editErrors };

                    colDef.resetColumnsInError.forEach((column) => {
                        if (Boolean(val) === column.value) {
                            delete updatedErrors[column.dependencyColumn];
                        }
                    });
                    gridContext.editErrors = updatedErrors;
                }
            },
            [colDef.resetColumnsInError, gridContext]
        );

        useEffect(() => {
            refreshEditingCell(gridApi);
        }, [gridApi, value]);

        return (
            <Select
                value={value}
                onChange={validateChange}
                size={'medium'}
                margin={'none'}
                style={{ width: '100%' }}
            >
                <MenuItem value={1} key={colDef.field + '_1'}>
                    <em>{intl.formatMessage({ id: 'true' })}</em>
                </MenuItem>
                <MenuItem value={0} key={colDef.field + '_0'}>
                    <em>{intl.formatMessage({ id: 'false' })}</em>
                </MenuItem>
            </Select>
        );
    }
);

export const SelectCountryField = forwardRef(
    ({ defaultValue, gridContext, colDef, gridApi }, ref) => {
        const [value, setValue] = useState(null);
        const { translate, countryCodes } = LocalizedCountries();

        useImperativeHandle(
            ref,
            () => {
                return {
                    getValue: () => {
                        return value;
                    },
                    getField: () => {
                        return colDef.field;
                    },
                };
            },
            [colDef.field, value]
        );

        useEffect(() => {
            refreshEditingCell(gridApi);
        }, [gridApi, value]);

        return (
            <Autocomplete
                options={countryCodes}
                getOptionLabel={(countryCode) => translate(countryCode)}
                style={{ width: '100%' }}
                onChange={(event, newValue) => {
                    setValue(newValue);
                    gridContext.dynamicValidation[colDef.field] = newValue;
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={<FormattedMessage id={'descLfAllCountries'} />}
                    />
                )}
            />
        );
    }
);
