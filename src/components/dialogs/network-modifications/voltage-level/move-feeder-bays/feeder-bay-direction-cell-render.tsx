/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { Box, IconButton, ToggleButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useController, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';
import type { MuiStyles } from '@gridsuite/commons-ui';

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        marginTop: 1.75,
    },
    button: {
        width: 100,
        whiteSpace: 'nowrap',
    },
} as const satisfies MuiStyles;

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

    const translatedLabel = useMemo(() => {
        const direction = Object.values(CONNECTION_DIRECTIONS_VALUES).find((dir) => dir.id === value);
        return direction ? intl.formatMessage({ id: direction.label }) : '';
    }, [intl, value]);

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
        <Box sx={styles.container}>
            <IconButton onClick={handleClick} size="small" disabled={disabled}>
                {value === CONNECTION_DIRECTIONS_VALUES.TOP.id ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>
            <ToggleButton value={value} onClick={handleClick} disabled={disabled} size="small" sx={styles.button}>
                {translatedLabel}
            </ToggleButton>
        </Box>
    );
}
