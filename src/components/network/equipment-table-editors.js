/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState, useEffect } from 'react';
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
            defaultValue={tapChanger.tapPosition}
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

export const NumericalField = ({
    defaultValue,
    min,
    max,
    setColumnError,
    resetColumnError,
    forceLineUpdate,
    columnDefinition,
    setter,
    style,
    ...props
}) => {
    const [error, setError] = useState(false);
    const [userChangeInProgress, setUserChangeInProgress] = useState(false);
    const [currentValue, setCurrentValue] = useState(defaultValue);
    const intl = useIntl();

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
                resetColumnError(columnDefinition.dataKey);
            } else {
                setError(true);
                setColumnError(columnDefinition.dataKey);
            }
        },
        [
            setError,
            min,
            max,
            isValid,
            setColumnError,
            resetColumnError,
            columnDefinition.dataKey,
        ]
    );

    const validateEvent = useCallback(
        (ev) => {
            const newVal = ev.target.value;
            setUserChangeInProgress(true);
            setter(newVal);
            setCurrentValue(newVal);
        },
        [setter]
    );

    useEffect(() => {
        // validate the initial state, or any further update
        validateChange(currentValue);
    }, [currentValue, validateChange]);

    const onFocusOut = useCallback(
        (ev) => {
            if (userChangeInProgress && columnDefinition.forceUpdateOnChange) {
                setUserChangeInProgress(false);
                // force a parent update: all Editors will be updated. Ex: usefull to propagate min/max updates
                forceLineUpdate();
            }
        },
        [
            forceLineUpdate,
            userChangeInProgress,
            columnDefinition.forceUpdateOnChange,
        ]
    );

    function renderNumericText() {
        return (
            <TextField
                value={currentValue}
                onChange={validateEvent}
                onBlur={onFocusOut}
                onMouseOut={onFocusOut}
                {...props}
                error={error}
                type="Number"
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

    return <div>{renderNumericTextWithTooltip()}</div>;
};

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

export const EnumField = ({
    enumList,
    setColumnError,
    resetColumnError,
    forceLineUpdate,
    columnDefinition,
    setter,
    defaultValue,
    ...props
}) => {
    const [value, setValue] = useState(defaultValue);
    const validateChange = useCallback(
        (ev) => {
            const val = ev.target.value;
            setValue(val);
            setter(val);
        },
        [setter]
    );
    return (
        <Select
            value={value}
            onChange={validateChange}
            size={'medium'}
            margin={'none'}
            {...props}
        >
            {enumList.map((e, index) => (
                // 'id' is displayed in the select as is
                <MenuItem value={e.id} key={e.id + '_' + index}>
                    <em>{e.id}</em>
                </MenuItem>
            ))}
        </Select>
    );
};
