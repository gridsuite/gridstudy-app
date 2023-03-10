/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    useCallback,
    useState,
    forwardRef,
    useImperativeHandle,
} from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TextField, Tooltip } from '@mui/material';
import { useIntl } from 'react-intl';

const ITEM_HEIGHT = 36;
const ITEMS_NUMBER = 5;
const ITEMS_PADDING = 8;

export const TapChangerSelector = ({
    tapChanger,
    setColumnError,
    resetColumnError,
    forceLineUpdate,
    columnDefinition,
    setter,
    defaultValue,
    ...props
}) => {
    return (
        <Select
            defaultValue={
                /*
                the generic caller code uses the 'numeric' attributes of the column
                to chose for the defaultValue prop either the raw value
                (here and object with a tapPosition field)
                or the formatted value (using cellDataGetter, here the tapPosition integer)
                so to avoid problems if this logic ever changes, don't use defaultValue here
                */
                tapChanger.tapPosition
            }
            onChange={(ev) => {
                setter({ ...tapChanger, tapPosition: ev.target.value });
            }}
            size={'medium'}
            margin={'none'}
            MenuProps={{
                PaperProps: {
                    sx: {
                        maxHeight: ITEM_HEIGHT * ITEMS_NUMBER + ITEMS_PADDING,
                    },
                },
            }}
            {...props}
        >
            {[
                ...Array(
                    tapChanger.highTapPosition - tapChanger.lowTapPosition + 1
                ),
            ].map((step, index) => (
                <MenuItem
                    key={'tapChanger' + index}
                    value={index + tapChanger.lowTapPosition}
                >
                    {index + tapChanger.lowTapPosition}
                </MenuItem>
            ))}
        </Select>
    );
};

export const NumericalField = forwardRef(
    (
        {
            defaultValue,
            min,
            max,
            addError,
            resetError,
            setter,
            style,
            inputProps,
            ...props
        },
        ref
    ) => {
        const [error, setError] = useState(false);
        const intl = useIntl();

        useImperativeHandle(ref, () => {
            return {
                getValue() {
                    return value;
                },
            };
        });

        const createInitialState = () => {
            return {
                value: defaultValue,
            };
        };

        const initialState = createInitialState();
        const [value, setValue] = useState(initialState.value);

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

        const validateChange = useCallback(
            (newVal) => {
                if (isValid(newVal, min, max)) {
                    setError(false);
                    props.colDef.additionnalEditorParams.resetError(
                        props.colDef.field
                    );
                    console.log('######### - DEBUG TAG - #########2');
                } else {
                    setError(true);
                    props.colDef.additionnalEditorParams.addError(
                        props.colDef.field
                    );
                    console.log('######### - DEBUG TAG - #########');
                }
            },
            [
                isValid,
                min,
                max,
                props.colDef.field,
                props.colDef.additionnalEditorParams,
            ]
        );

        const validateEvent = useCallback(
            (ev) => {
                const newVal = ev.target.value;
                setValue(newVal);
                validateChange(newVal);
            },
            [validateChange]
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
                    style={{ ...style, padding: 0 }}
                    inputProps={{
                        style: {
                            textAlign: 'center',
                            fontSize: 'small',
                        },
                        min: { min },
                        max: { max },
                        step: 'any',
                        lang: 'en-US', // to have . as decimal separator
                        ...inputProps,
                    }}
                />
            );
        }

        function renderNumericTextWithTooltip() {
            let tooltip = '';
            if (min !== undefined && max !== undefined) {
                tooltip = intl.formatMessage({ id: 'MinMax' }, { min, max });
            } else if (min !== undefined) {
                tooltip = intl.formatMessage({ id: 'OnlyMin' }, { min });
            } else if (max !== undefined) {
                tooltip = intl.formatMessage({ id: 'OnlyMax' }, { max });
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

export const NameField = ({
    defaultValue,
    setColumnError,
    resetColumnError,
    forceLineUpdate,
    columnDefinition,
    setter,
    style,
    ...props
}) => {
    const validateChange = useCallback(
        (ev) => {
            const newVal = ev.target.value;
            setter(newVal);
        },
        [setter]
    );

    return (
        <TextField
            defaultValue={defaultValue}
            onChange={validateChange}
            {...props}
            size={'small'}
            margin={'none'}
            style={{ ...style, padding: 0 }}
            inputProps={{
                style: {
                    textAlign: 'center',
                    fontSize: 'small',
                },
            }}
        />
    );
};

export const BooleanListField = ({
    setColumnError,
    resetColumnError,
    forceLineUpdate,
    columnDefinition,
    setter,
    defaultValue,
    ...props
}) => {
    const intl = useIntl();
    const [value, setValue] = useState(defaultValue === true ? 1 : 0);

    const validateChange = useCallback(
        (ev) => {
            const val = ev.target.value;
            setValue(val);
            setter(val === 1);

            if (columnDefinition.forceUpdateOnChange) {
                forceLineUpdate();
            }
            if (columnDefinition.resetColumnsInError) {
                columnDefinition.resetColumnsInError.forEach((column) => {
                    if (Boolean(val) === column.value) {
                        resetColumnError(column.dependencyColumn);
                    }
                });
            }
        },
        [
            setter,
            forceLineUpdate,
            columnDefinition.forceUpdateOnChange,
            columnDefinition.resetColumnsInError,
            resetColumnError,
        ]
    );

    return (
        <Select
            value={value}
            onChange={validateChange}
            size={'medium'}
            margin={'none'}
            {...props}
        >
            <MenuItem value={1} key={columnDefinition.dataKey + '_1'}>
                <em>{intl.formatMessage({ id: 'true' })}</em>
            </MenuItem>
            <MenuItem value={0} key={columnDefinition.dataKey + '_0'}>
                <em>{intl.formatMessage({ id: 'false' })}</em>
            </MenuItem>
        </Select>
    );
};
