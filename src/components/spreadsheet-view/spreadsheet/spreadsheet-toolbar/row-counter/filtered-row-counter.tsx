/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';
import { SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { Box, Fade, Theme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { resetSpreadsheetColumnsFilters } from '../../../../../services/study/study-config';
import Tooltip from '@mui/material/Tooltip';
import { useFilteredRowCounterInfo } from './use-filtered-row-counter';

const styles = {
    getContainer: (theme: Theme, isAnyFilterPresent: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: theme.spacing(15),
        minHeight: theme.spacing(3.8),
        border: `solid 1px ${isAnyFilterPresent ? theme.aggrid.filterCounter : 'rgba(0, 0, 0, 0.23)'}`,
        borderRadius: '6px',
        paddingRight: '10px',
        paddingLeft: '10px',
        cursor: `${isAnyFilterPresent ? 'pointer' : 'default'}`,
        fontSize: '13px',
    }),
    innerContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'pre-line',
    },
    restoreButton: (theme: Theme) => ({
        color: `${theme.aggrid.filterCounter}`,
        paddingRight: '3px',
    }),
};

export type SpreadsheetFilteredRowCountProps = {
    gridRef: React.RefObject<AgGridReact>;
    tableDefinition: SpreadsheetTabDefinition;
};

export function FilteredRowCounter({ gridRef, tableDefinition }: Readonly<SpreadsheetFilteredRowCountProps>) {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const { isLoading, isAnyFilterPresent, rowCountLabel, filtersSummary } = useFilteredRowCounterInfo({
        gridRef,
        tableDefinition,
    });

    const handleResetFilters = useCallback(() => {
        if (isAnyFilterPresent && studyUuid) {
            resetSpreadsheetColumnsFilters(studyUuid, tableDefinition.uuid).catch((error) =>
                console.error('Failed to update global filters:', error)
            );
            gridRef.current?.api?.onFilterChanged();
        }
    }, [gridRef, isAnyFilterPresent, studyUuid, tableDefinition.uuid]);

    const FilterCounter = (
        <Box sx={(theme) => styles.getContainer(theme, isAnyFilterPresent ?? false)} onClick={handleResetFilters}>
            {isLoading ? (
                <CircularProgress size="0.75rem" />
            ) : (
                <Fade in timeout={600} key={rowCountLabel}>
                    <Box sx={styles.innerContainer}>
                        {isAnyFilterPresent && <FilterAltOffIcon sx={styles.restoreButton} />}
                        {rowCountLabel}
                    </Box>
                </Fade>
            )}
        </Box>
    );

    return filtersSummary ? (
        <Tooltip
            title={<div style={{ whiteSpace: 'pre-line' }}>{filtersSummary}</div>}
            placement="bottom-start"
            sx={{ marginLeft: 1 }}
        >
            {FilterCounter}
        </Tooltip>
    ) : (
        FilterCounter
    );
}
