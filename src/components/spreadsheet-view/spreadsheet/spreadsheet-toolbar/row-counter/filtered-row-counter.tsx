/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { type RefObject, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';
import { SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { Box, Fade, Theme, CircularProgress, Button, Tooltip } from '@mui/material';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { resetSpreadsheetColumnsFilters } from '../../../../../services/study/study-config';
import { useFilteredRowCounterInfo } from './use-filtered-row-counter';

const styles = {
    getContainer: (theme: Theme) => ({
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
};

export type SpreadsheetFilteredRowCountProps = {
    gridRef: RefObject<AgGridReact>;
    tableDefinition: SpreadsheetTabDefinition;
    disabled: boolean;
};

export function FilteredRowCounter({ gridRef, tableDefinition, disabled }: Readonly<SpreadsheetFilteredRowCountProps>) {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const { isLoading, isAnyFilterPresent, rowCountLabel, tooltipContent } = useFilteredRowCounterInfo({
        gridRef,
        tableDefinition,
        disabled,
    });

    const handleResetFilters = useCallback(() => {
        if (isAnyFilterPresent && studyUuid) {
            resetSpreadsheetColumnsFilters(studyUuid, tableDefinition.uuid).catch((error) =>
                console.error('Failed to update global filters:', error)
            );
            gridRef.current?.api?.onFilterChanged();
        }
    }, [gridRef, isAnyFilterPresent, studyUuid, tableDefinition.uuid]);

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
