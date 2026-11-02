/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type ReactNode, useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import { FormattedMessage } from 'react-intl';
import { mergeSx, type MuiStyles } from '@gridsuite/commons-ui';

const styles = {
    // Same look as the country chips of the results' global filter, whose styles commons-ui does not export
    chip: (theme) => ({
        alignSelf: 'center',
        maxWidth: theme.spacing(24),
        '&.MuiChip-root': {
            margin: '1px 2px',
            padding: 0,
            color: 'white',
            backgroundColor: `${theme.palette.info.main}!important`,
        },
        '&.MuiChip-clickable:hover, &.MuiChip-deletable:hover, &.Mui-focusVisible': {
            backgroundColor: `${theme.palette.info.dark}!important`,
        },
        '& .MuiChip-icon': {
            color: 'white',
            fontSize: theme.spacing(1.75),
        },
        '& .MuiChip-deleteIcon': {
            color: 'white',
            opacity: 0.6,
        },
        '& .MuiChip-deleteIcon:hover': {
            color: 'white',
            opacity: 1,
        },
    }),
    deletedChip: (theme) => ({
        '&.MuiChip-root': {
            backgroundColor: `${theme.palette.error.main}!important`,
        },
        '&.MuiChip-clickable:hover, &.MuiChip-deletable:hover, &.Mui-focusVisible': {
            backgroundColor: `${theme.palette.error.dark}!important`,
        },
    }),
} as const satisfies MuiStyles;

interface FilterChipProps {
    readonly filterName?: string;
    readonly isFilterDeleted: boolean;
    readonly isEditMode: boolean;
    readonly disabled?: boolean;
    readonly onChange: () => void;
    readonly onRemove: () => void;
}

export default function FilterChip({
    filterName,
    isFilterDeleted,
    isEditMode,
    disabled,
    onChange,
    onRemove,
}: FilterChipProps) {
    // A single tooltip for the chip and its remove icon
    const [isRemoveHovered, setIsRemoveHovered] = useState(false);

    let label: ReactNode = filterName;
    if (isFilterDeleted) {
        // Diagrams saved before filter names were saved have none
        label = filterName ? (
            <FormattedMessage id="nadDeletedFilter" values={{ filterName }} />
        ) : (
            <FormattedMessage id="nadDeletedUnnamedFilter" />
        );
    }
    let tooltipId = isFilterDeleted ? 'nadDeletedFilterMessage' : 'nadFilterMode';
    if (isEditMode) {
        tooltipId = isRemoveHovered ? 'nadRemoveFilter' : 'nadChangeFilter';
    }

    return (
        <Tooltip title={<FormattedMessage id={tooltipId} />}>
            <Chip
                size="small"
                sx={mergeSx(styles.chip, isFilterDeleted ? styles.deletedChip : undefined)}
                icon={<FilterAltIcon />}
                label={label}
                disabled={isEditMode && disabled}
                onClick={isEditMode ? onChange : undefined}
                onDelete={isEditMode ? onRemove : undefined}
                deleteIcon={
                    <CancelIcon
                        onMouseEnter={() => setIsRemoveHovered(true)}
                        onMouseLeave={() => setIsRemoveHovered(false)}
                    />
                }
            />
        </Tooltip>
    );
}
