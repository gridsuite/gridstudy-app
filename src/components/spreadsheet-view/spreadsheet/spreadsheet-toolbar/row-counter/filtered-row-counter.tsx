/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer.type';
import { SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { Box, Button, CircularProgress, Fade, Tooltip } from '@mui/material';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { resetSpreadsheetColumnsFilters } from '../../../../../services/study/study-config';
import { UseFilteredRowCounterInfoReturn } from './use-filtered-row-counter';
import { type MuiStyles, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';

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

export type SpreadsheetFilteredRowCountProps = {
    rowCounterInfos: UseFilteredRowCounterInfoReturn;
    tableDefinition: SpreadsheetTabDefinition;
};

export function FilteredRowCounter({ rowCounterInfos, tableDefinition }: Readonly<SpreadsheetFilteredRowCountProps>) {
    const { isLoading, isAnyFilterPresent, rowCountLabel, tooltipContent } = rowCounterInfos;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();

    const handleResetFilters = useCallback(() => {
        if (isAnyFilterPresent && studyUuid) {
            resetSpreadsheetColumnsFilters(studyUuid, tableDefinition.uuid).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'spreadsheet/reset_filters_error' });
            });
        }
    }, [isAnyFilterPresent, snackError, studyUuid, tableDefinition.uuid]);

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
