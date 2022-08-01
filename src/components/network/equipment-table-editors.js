/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import { TextField, Tooltip } from '@mui/material';
import { useIntl } from 'react-intl';

const ITEM_HEIGHT = 36;
const ITEMS_NUMBER = 5;
const ITEMS_PADDING = 8;

export const TapChangerSelector = ({
    tapChanger,
    setcolerror,
    resetcolerror,
    datakey,
    setter,
    defaultValue,
    ...props
}) => {
    return (
        <Select
            defaultValue={defaultValue}
            onChange={(ev) => setter(ev.target.value)}
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
            {[...Array(tapChanger.highTap - tapChanger.lowTap + 1)].map(
                (step, index) => (
                    <MenuItem
                        key={'tapChanger' + index}
                        value={index + tapChanger.lowTap}
                    >
                        {index + tapChanger.lowTap}
                    </MenuItem>
                )
            )}
        </Select>
    );
};

export const NumericalField = ({
    defaultValue,
    min,
    max,
    setcolerror,
    resetcolerror,
    datakey,
    setter,
    style,
    ...props
}) => {
    const [error, setError] = useState(false);
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
        (ev) => {
            const newVal = ev.target.value;
            if (isValid(newVal, min, max)) {
                setError(false);
                resetcolerror(datakey);
            } else {
                setError(true);
                setcolerror(datakey);
            }
            setter(newVal);
        },
        [
            setError,
            min,
            max,
            setter,
            isValid,
            setcolerror,
            resetcolerror,
            datakey,
        ]
    );

    function renderNumericText() {
        return (
            <TextField
                defaultValue={defaultValue}
                onChange={validateChange}
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
    setcolerror,
    resetcolerror,
    datakey,
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

export const BooleanCheckField = ({
    defaultValue,
    setcolerror,
    resetcolerror,
    datakey,
    setter,
    style,
    ...props
}) => {
    const [checked, setChecked] = useState(defaultValue);

    const validateChange = useCallback(
        (ev) => {
            const boolValue = ev.target.checked;
            setChecked(boolValue);
            setter(boolValue);
        },
        [setter]
    );

    return (
        <Checkbox
            checked={checked}
            indeterminate={checked === null}
            onChange={validateChange}
            {...props}
            color="default"
            disableRipple={true}
            style={{ ...style, borderRadius: 0 }}
        />
    );
};

export const BooleanListField = ({
    setcolerror,
    resetcolerror,
    datakey,
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
            <MenuItem value={1} key={datakey + '_1'}>
                <em>{intl.formatMessage({ id: 'true' })}</em>
            </MenuItem>
            <MenuItem value={0} key={datakey + '_0'}>
                <em>{intl.formatMessage({ id: 'false' })}</em>
            </MenuItem>
        </Select>
    );
};

export const EnumField = ({
    enumList,
    setcolerror,
    resetcolerror,
    datakey,
    setter,
    defaultValue,
    ...props
}) => {
    return (
        <Select
            defaultValue={defaultValue || ''}
            onChange={(ev) => setter(ev.target.value)}
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
