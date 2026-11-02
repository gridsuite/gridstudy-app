/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback } from 'react';
import { Box, Button, CircularProgress, Fade, Tooltip } from '@mui/material';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { UseFilteredRowCounterInfoReturn } from './use-filtered-row-counter';
import { type MuiStyles } from '@gridsuite/commons-ui';

const styles = {
    getContainer: (theme) => ({
        minWidth: theme.spacing(18),
        paddingRight: '10px',
        paddingLeft: '10px',
    }),
    innerContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'pre-line',
    },
    restoreButton: {
        paddingRight: '3px',
    },
} as const satisfies MuiStyles;

export type FilteredRowCounterProps = {
    rowCounterInfos: UseFilteredRowCounterInfoReturn;
    // resets every filter taken into account by the counter (global filters and columns filters)
    onResetFilters: () => void;
};

export function FilteredRowCounter({ rowCounterInfos, onResetFilters }: Readonly<FilteredRowCounterProps>) {
    const { isLoading, isAnyFilterPresent, rowCountLabel, tooltipContent } = rowCounterInfos;

    const handleResetFilters = useCallback(() => {
        if (isAnyFilterPresent) {
            onResetFilters();
        }
    }, [isAnyFilterPresent, onResetFilters]);

    return (
        <Tooltip title={tooltipContent} placement="bottom-start" sx={{ marginLeft: 1 }}>
            <span>
                {
                    <Button
                        variant={'text'}
                        onClick={handleResetFilters}
                        disabled={!isAnyFilterPresent}
                        sx={styles.getContainer}
                    >
                        {isLoading ? (
                            <CircularProgress size="0.75rem" />
                        ) : (
                            <Fade in timeout={600} key={rowCountLabel}>
                                <Box sx={styles.innerContainer}>
                                    <FilterAltOffIcon sx={styles.restoreButton} />
                                    {rowCountLabel}
                                </Box>
                            </Fade>
                        )}
                    </Button>
                }
            </span>
        </Tooltip>
    );
}
