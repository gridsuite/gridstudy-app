import React, { useCallback, useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TextField, Tooltip } from '@mui/material';
import { useIntl } from 'react-intl';
import { ROW_HEIGHT } from './config-tables';

export const TapChangerSelector = ({
    tapChanger,
    setter,
    defaultValue,
    style,
    ...props
}) => {
    const getStyle = () => {
        if (style.width) {
            let updatedStyle = { ...style };
            updatedStyle.width = style.width - 10;
            return updatedStyle;
        }
        return style;
    };

    return (
        <Select
            defaultValue={defaultValue}
            onChange={(ev) => setter(ev.target.value)}
            size={'medium'}
            margin={'none'}
            style={getStyle()}
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
            if (newVal >= min && newVal <= max) {
                setError(false);
                setter(newVal);
            } else {
                setError(true);
                setter(defaultValue);
            }
        },
        [setError, min, max, setter, defaultValue]
    );

    return (
        <Tooltip title={intl.formatMessage({ id: 'MinMax' }, { min, max })}>
            <TextField
                defaultValue={defaultValue}
                onChange={validateChange}
                {...props}
                error={error}
                type="Number"
                size={'small'}
                margin={'none'}
                style={{ ...style, margin: '5px 0 0 0', padding: 0 }}
                inputProps={{
                    style: {
                        textAlign: 'center',
                        fontSize: 'small',
                        height: ROW_HEIGHT - 1 + 'px',
                        padding: 0,
                        margin: 0,
                    },
                    inputProps: { min: { min }, max: { max } },
                }}
            />
        </Tooltip>
    );
};
