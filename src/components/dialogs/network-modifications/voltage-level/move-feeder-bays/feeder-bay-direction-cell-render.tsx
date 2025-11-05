/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useCallback, useMemo } from 'react';
import { IconButton, ToggleButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useController, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { HorizontalRule } from '@mui/icons-material';
import { CONNECTION_DIRECTIONS_VALUES } from './move-voltage-level-feeder-bays.type';
import { MuiStyles } from '@gridsuite/commons-ui';

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        border: 'none',
        gap: 2,
        padding: '1rem',
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },
} as const satisfies MuiStyles;

type FeederBayDirectionCellRendererProps = {
    name: string;
    disabled: boolean;
};

const DIRECTION_CYCLE: Record<string, string> = {
    [CONNECTION_DIRECTIONS_VALUES.TOP.id]: CONNECTION_DIRECTIONS_VALUES.BOTTOM.id,
    [CONNECTION_DIRECTIONS_VALUES.BOTTOM.id]: CONNECTION_DIRECTIONS_VALUES.UNDEFINED.id,
    [CONNECTION_DIRECTIONS_VALUES.UNDEFINED.id]: CONNECTION_DIRECTIONS_VALUES.TOP.id,
};

const DIRECTION_ICONS: Record<string, ReactNode> = {
    [CONNECTION_DIRECTIONS_VALUES.TOP.id]: <ArrowUpwardIcon />,
    [CONNECTION_DIRECTIONS_VALUES.BOTTOM.id]: <ArrowDownwardIcon />,
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
        const valueToFind = value ?? 'UNDEFINED'; // null ou undefined → 'UNDEFINED'
        const direction = Object.values(CONNECTION_DIRECTIONS_VALUES).find((dir) => dir.id === valueToFind);
        return direction ? intl.formatMessage({ id: direction.label }) : '';
    }, [intl, value]);

    const handleClick = useCallback(() => {
        const newValue = DIRECTION_CYCLE[value] || CONNECTION_DIRECTIONS_VALUES.TOP.id; // from null or UNDEFINED, go to TOP
        setValue(name, newValue, {
            shouldDirty: true,
            shouldTouch: true,
        });
    }, [value, setValue, name]);
    return (
        <ToggleButton value={value} onClick={handleClick} disabled={disabled} size="small" sx={styles.container}>
            <IconButton onClick={handleClick} size="small" disabled={disabled}>
                {DIRECTION_ICONS[value] || <HorizontalRule />}
            </IconButton>
            <span>{translatedLabel}</span>
        </ToggleButton>
    );
}
