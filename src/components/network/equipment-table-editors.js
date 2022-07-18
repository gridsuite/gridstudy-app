/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TextField, Tooltip } from '@mui/material';
import { useIntl } from 'react-intl';

const ITEM_HEIGHT = 36;
const ITEMS_NUMBER = 5;
const ITEMS_PADDING = 8;

export const TapChangerSelector = ({
    tapChanger,
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
    setter,
    style,
    ...props
}) => {
    const [error, setError] = useState(false);
    const intl = useIntl();

    const validateChange = useCallback(
        (ev) => {
            const newVal = ev.target.value;
            if (
                (min === undefined || newVal >= min) &&
                (max === undefined || newVal <= max)
            ) {
                setError(false);
            } else {
                setError(true);
            }
            setter(newVal);
        },
        [setError, min, max, setter]
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
                        flexGrow: 1,
                    },
                    min: { min },
                    max: { max },
                    step: 'any',
                }}
            />
        );
    }

    return (
        <div>
            {min !== undefined || max !== undefined ? (
                <Tooltip
                    title={intl.formatMessage({ id: 'MinMax' }, { min, max })}
                >
                    {renderNumericText()}
                </Tooltip>
            ) : (
                renderNumericText()
            )}
        </div>
    );
};

export const NameField = ({ defaultValue, setter, style, ...props }) => {
    return (
        <TextField
            defaultValue={defaultValue}
            onChange={(ev) => setter(ev.target.value)}
            {...props}
            size={'small'}
            margin={'none'}
            style={{ ...style, padding: 0 }}
            inputProps={{
                style: {
                    textAlign: 'center',
                    fontSize: 'small',
                    flexGrow: 1,
                },
            }}
        />
    );
};

export const EnumField = ({ enumList, setter, defaultValue, ...props }) => {
    return (
        <Select
            defaultValue={defaultValue || ''}
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
            {enumList.map((e, index) => (
                // 'id' is displayed in the select as is
                <MenuItem value={e.id} key={e.id + '_' + index}>
                    <em>{e.id}</em>
                </MenuItem>
            ))}
        </Select>
    );
};
