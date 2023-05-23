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
import { TextField, Tooltip } from '@mui/material';
import { useIntl } from 'react-intl';
import { EDIT_COLUMN } from './config-tables';

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

    console.log(dependencyEditor);
    return dependencyEditor.length > 0
        ? dependencyEditor[0].getValue() !==
              colDef.crossValidation.requiredOn.columnValue
        : false;
};

export const NumericalField = forwardRef(
    (
        {
            defaultValue,
            minExpression,
            maxExpression,
            gridContext,
            data,
            colDef,
            gridApi,
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
            if (gridContext.dynamicValidation[minExpression]) {
                return gridContext.dynamicValidation[minExpression];
            }
            return data[minExpression];
        }, [minExpression, gridContext.dynamicValidation, data]);

        const getMax = useCallback(() => {
            if (!isNaN(maxExpression)) {
                return maxExpression;
            }
            if (gridContext.dynamicValidation[maxExpression]) {
                return gridContext.dynamicValidation[maxExpression];
            }
            return data[maxExpression];
        }, [maxExpression, gridContext.dynamicValidation, data]);

        const [minValue, setMinValue] = useState(getMin());
        const [maxValue, setMaxValue] = useState(getMax());
        const [value, setValue] = useState(defaultValue);

        useEffect(() => {
            refreshEditingCell(gridApi);
        }, [gridApi, value]);

        const isValid = useCallback(
            (val, minVal, maxVal) => {
                if (colDef.crossValidation?.requiredOn) {
                    const isConditionFulfiled = checkCrossValidationRequiredOn(
                        gridApi,
                        colDef
                    );
                    if (isConditionFulfiled && !val) {
                        return true;
                    }
                }
                if (isNaN(val)) {
                    return false;
                }
                let valFloat = parseFloat(val);
                if (isNaN(valFloat)) {
                    return false;
                }
                return (
                    (minVal === undefined || valFloat >= minVal) &&
                    (maxVal === undefined || valFloat <= maxVal)
                );
            },
            [colDef, gridApi]
        );

        const validateChange = useCallback(() => {
            const updatedErrors = { ...gridContext.editErrors };
            if (isValid(value, minValue, maxValue)) {
                setError(false);
                delete updatedErrors[colDef.field];
                gridContext.editErrors = updatedErrors;
            } else {
                setError(true);
                updatedErrors[colDef.field] = true;
                gridContext.editErrors = updatedErrors;
            }
        }, [colDef.field, gridContext, minValue, maxValue, value, isValid]);

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
                const newVal = ev.target.value;
                setValue(newVal);
                gridContext.dynamicValidation[colDef.field] =
                    parseFloat(newVal);
            },
            [colDef.field, gridContext.dynamicValidation]
        );

        function renderNumericText() {
            return (
                <TextField
                    value={value || ''}
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
