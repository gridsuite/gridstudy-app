/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
import { IconButton, TextField } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useController, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { TextInput } from '@gridsuite/commons-ui';

const CONNECTION_DIRECTIONS_VALUES = {
    TOP: { id: 'TOP', label: 'Top' },
    BOTTOM: { id: 'BOTTOM', label: 'Bottom' },
} as const;

type FeederBayDirectionCellRendererProps = {
    name: string;
    disabled: boolean;
};

export default function FeederBayDirectionCellRenderer({
    name,
    disabled,
}: Readonly<FeederBayDirectionCellRendererProps>) {
    const { setValue } = useFormContext();
    const {
        field: { value },
    } = useController({ name });
    const intl = useIntl();

    const getTranslatedLabel = useCallback(
        (directionId: string) => {
            const direction = Object.values(CONNECTION_DIRECTIONS_VALUES).find((dir) => dir.id === directionId);
            return direction ? intl.formatMessage({ id: direction.label }) : '';
        },
        [intl]
    );

    const handleClick = useCallback(() => {
        if (value) {
            const newValue =
                value === CONNECTION_DIRECTIONS_VALUES.TOP.id
                    ? CONNECTION_DIRECTIONS_VALUES.BOTTOM.id
                    : CONNECTION_DIRECTIONS_VALUES.TOP.id;
            setValue(name, newValue, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            });
        }
    }, [value, setValue, name]);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                pointerEvents: disabled ? 'none' : 'auto',
            }}
        >
            <IconButton onClick={handleClick} size="small" disabled={disabled}>
                {value === CONNECTION_DIRECTIONS_VALUES.TOP.id ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>
            <TextField
                value={getTranslatedLabel(value)}
                size="small"
                variant="filled"
                InputProps={{
                    readOnly: true,
                    style: { cursor: 'pointer', textAlign: 'center' },
                }}
                onClick={handleClick}
                sx={{
                    padding: '8px',
                    '& input': {
                        textAlign: 'center',
                    },
                }}
                disabled={disabled}
            />
            <div style={{ display: 'none' }}>
                <TextInput name={name} />
            </div>
        </div>
    );
}
