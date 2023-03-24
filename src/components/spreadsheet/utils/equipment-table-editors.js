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

const refreshEditingCell = (params) => {
    const rowNode = params.api.getPinnedTopRow(0);
    if (rowNode) {
        const refreshConfig = {
            rowNodes: [rowNode],
            columns: [EDIT_COLUMN],
            force: true,
        };
        params.api.getCellEditorInstances().forEach((cellEditor) => {
            if (cellEditor.refreshValidation) {
                cellEditor.refreshValidation();
            }
        });
        params.api.refreshCells(refreshConfig);
    }
};

export const NumericalField = forwardRef(
    ({ defaultValue, minExpression, maxExpression, ...props }, ref) => {
        const [error, setError] = useState(false);
        const intl = useIntl();

        //minExpression and maxExpression are either a reference to a variable or a static number
        const getMin = useCallback(() => {
            if (!isNaN(minExpression)) {
                return minExpression;
            }
            if (props.context.dynamicValidation[minExpression]) {
                return props.context.dynamicValidation[minExpression];
            }
            return props.data[minExpression];
        }, [minExpression, props.context.dynamicValidation, props.data]);

        const getMax = useCallback(() => {
            if (!isNaN(maxExpression)) {
                return maxExpression;
            }
            if (props.context.dynamicValidation[maxExpression]) {
                return props.context.dynamicValidation[maxExpression];
            }
            return props.data[maxExpression];
        }, [maxExpression, props.context.dynamicValidation, props.data]);

        const [minValue, setMinValue] = useState(getMin());
        const [maxValue, setMaxValue] = useState(getMax());
        const [value, setValue] = useState(defaultValue);

        useEffect(() => {
            refreshEditingCell(props);
        }, [props, value]);

        const isValid = useCallback((val, minVal, maxVal) => {
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
        }, []);

        const validateChange = useCallback(() => {
            const updatedErrors = { ...props.context.editErrors };
            if (isValid(value, minValue, maxValue)) {
                setError(false);
                delete updatedErrors[props.colDef.field];
                props.context.editErrors = updatedErrors;
            } else {
                setError(true);
                updatedErrors[props.colDef.field] = true;
                props.context.editErrors = updatedErrors;
            }
        }, [
            props.colDef.field,
            props.context,
            minValue,
            maxValue,
            value,
            isValid,
        ]);

        useImperativeHandle(
            ref,
            () => {
                return {
                    getValue() {
                        return value;
                    },
                    refreshValidation() {
                        setMaxValue(getMax());
                        setMinValue(getMin());
                        validateChange();
                    },
                };
            },
            [getMax, getMin, validateChange, value]
        );

        const validateEvent = useCallback(
            (ev) => {
                const newVal = ev.target.value;
                setValue(newVal);
                props.context.dynamicValidation[props.colDef.field] =
                    parseFloat(newVal);
            },
            [props]
        );

        function renderNumericText() {
            return (
                <TextField
                    ref={ref}
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
    ({ defaultValue, ...props }, ref) => {
        const intl = useIntl();
        const [value, setValue] = useState(defaultValue);

        useImperativeHandle(
            ref,
            () => {
                return {
                    getValue() {
                        return value;
                    },
                };
            },
            [value]
        );

        const validateChange = useCallback(
            (ev) => {
                const val = ev.target.value;
                setValue(val);
                if (props.colDef.resetColumnsInError) {
                    const updatedErrors = { ...props.context.editErrors };

                    props.colDef.resetColumnsInError.forEach((column) => {
                        if (Boolean(val) === column.value) {
                            delete updatedErrors[column.dependencyColumn];
                        }
                    });
                    props.context.editErrors = updatedErrors;
                }
                refreshEditingCell(props);
            },
            [props]
        );

        return (
            <Select
                ref={ref}
                value={value}
                onChange={validateChange}
                size={'medium'}
                margin={'none'}
                style={{ width: '100%' }}
            >
                <MenuItem value={1} key={props.colDef.field + '_1'}>
                    <em>{intl.formatMessage({ id: 'true' })}</em>
                </MenuItem>
                <MenuItem value={0} key={props.colDef.field + '_0'}>
                    <em>{intl.formatMessage({ id: 'false' })}</em>
                </MenuItem>
            </Select>
        );
    }
);
