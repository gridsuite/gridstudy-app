/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { SpreadsheetTabDefinition } from '../../types/spreadsheet.type';
import { Box, debounce, Fade, Theme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useIntl } from 'react-intl';
import RestoreIcon from '@mui/icons-material/Restore';
import { resetSpreadsheetColumnsFilters } from '../../../../services/study/study-config';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';

const styles = {
    getContainer: (theme: Theme, isAnyFilterPresent: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: theme.spacing(15),
        minHeight: theme.spacing(5),
        border: `solid 1px ${isAnyFilterPresent ? theme.node.hover : 'rgba(0, 0, 0, 0.23)'}`,
        borderRadius: '6px',
        padding: '5px',
        paddingRight: '20px',
        paddingLeft: '20px',
        cursor: `${isAnyFilterPresent ? 'pointer' : 'default'}`,
    }),
    innerContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'pre-line',
    },
    restoreButton: (theme: Theme) => ({
        color: `${theme.node.hover}`,
        paddingRight: '3px',
    }),
};

export type SpreadsheetFilteredRowCountProps = {
    gridRef: React.RefObject<AgGridReact>;
    tableDefinition: SpreadsheetTabDefinition;
};

export function FilteredRowCounter({ gridRef, tableDefinition }: Readonly<SpreadsheetFilteredRowCountProps>) {
    const intl = useIntl();

    const [displayedRows, setDisplayedRows] = useState<number | null>(null);
    const [totalRows, setTotalRows] = useState<number | null>(null);
    const [isLoading, setLoading] = useState(true);

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const equipments = useSelector((state: AppState) => state.spreadsheetNetwork[tableDefinition?.type]);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const globalFilterSpreadsheetState = useSelector(
        (state: AppState) => state.globalFilterSpreadsheetState[tableDefinition.uuid]
    );

    const isAnyFilterPresent = gridRef.current?.api.isAnyFilterPresent();

    // Update is debounced to avoid displayed row count falsely set to 0 because of AG Grid internal behaviour which briefly set row count to 0 in between filters
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedUpdateRowCount = useCallback(
        debounce(() => {
            if (!gridRef.current?.api || !currentNode) {
                return;
            }
            const api = gridRef.current.api;
            const total = equipments.equipmentsByNodeId[currentNode.id]?.length ?? 0;
            const displayed = api.getDisplayedRowCount();
            setDisplayedRows(displayed);
            setTotalRows(total);
            setLoading(false);
        }, 600),
        [gridRef, currentNode, equipments.equipmentsByNodeId]
    );

    useEffect(() => {
        const api = gridRef.current?.api;
        if (!api || !currentNode) {
            return;
        }
        const onFilterChanged = () => setLoading(true);
        const onModelUpdated = () => debouncedUpdateRowCount();
        //Initial display
        debouncedUpdateRowCount();
        api.addEventListener('filterChanged', onFilterChanged);
        api.addEventListener('modelUpdated', onModelUpdated);

        return () => {
            api.removeEventListener('filterChanged', onFilterChanged);
            api.removeEventListener('modelUpdated', onModelUpdated);
        };
    }, [gridRef, currentNode, debouncedUpdateRowCount]);

    const content = useMemo(() => {
        if (isLoading || displayedRows === null || totalRows === null) {
            return '';
        }
        const plural =
            totalRows === 1 ? `${intl.formatMessage({ id: 'Rows' })}` : `${intl.formatMessage({ id: 'Rows' })}s`;
        if (displayedRows === 0 && totalRows > 0) {
            return intl.formatMessage({ id: 'NoMatch' });
        } else {
            return displayedRows !== totalRows ? `${displayedRows} / ${totalRows} ${plural}` : `${totalRows} ${plural}`;
        }
    }, [isLoading, displayedRows, totalRows, intl]);

    const resetFilters = useCallback(() => {
        if (isAnyFilterPresent && studyUuid) {
            resetSpreadsheetColumnsFilters(studyUuid, tableDefinition.uuid).catch((error) =>
                console.error('Failed to update global filters:', error)
            );
            gridRef.current?.api?.onFilterChanged();
        }
    }, [gridRef, isAnyFilterPresent, studyUuid, tableDefinition.uuid]);

    const activeFiltersList = useMemo(() => {
        const gsFilterByType = globalFilterSpreadsheetState.reduce<Record<string, string[]>>((acc, item) => {
            if (!acc[item.filterType]) {
                acc[item.filterType] = [];
            }
            acc[item.filterType].push(item.label);
            return acc;
        }, {});

        let globalFiltersInfo = '';
        if (Object.values(gsFilterByType).length > 0) {
            globalFiltersInfo = globalFiltersInfo.concat('Filtres externes : ');
        }
        Object.entries(gsFilterByType).forEach(([filterType, labels]) => {
            globalFiltersInfo = globalFiltersInfo.concat(`\n- ${intl.formatMessage({ id: filterType })} : "`);
            labels.forEach((label, index) => {
                globalFiltersInfo = globalFiltersInfo.concat(
                    `${intl.formatMessage({ id: label })}${index < labels.length - 1 ? ',' : ''}`
                );
            });
            globalFiltersInfo = globalFiltersInfo.concat('"');
        });

        const columnsFilters = gridRef.current?.api?.getFilterModel();
        if (columnsFilters && Object.keys(columnsFilters)?.length > 0) {
            globalFiltersInfo = globalFiltersInfo.concat(
                `${globalFiltersInfo.length !== 0 ? '\n' : ''}Filtres de colonnes : `
            );
            Object.entries(columnsFilters).forEach(([filterType, labels]) => {
                globalFiltersInfo = globalFiltersInfo.concat(
                    `\n- ${intl.formatMessage({ id: filterType })} : "${labels.filter}"`
                );
            });
        }

        return globalFiltersInfo;
    }, [globalFilterSpreadsheetState, gridRef, intl]);

    return (
        <Box sx={(theme) => styles.getContainer(theme, isAnyFilterPresent ?? false)} onClick={resetFilters}>
            {isLoading ? (
                <CircularProgress size="1rem" />
            ) : (
                <Fade in timeout={600} key={content}>
                    <Box sx={styles.innerContainer}>
                        {isAnyFilterPresent && <RestoreIcon sx={styles.restoreButton} />}
                        {content}
                        {isAnyFilterPresent && (
                            <Tooltip
                                title={<div style={{ whiteSpace: 'pre-line' }}>{activeFiltersList}</div>}
                                placement="right-start"
                                sx={{ marginLeft: 1 }}
                            >
                                <InfoIcon />
                            </Tooltip>
                        )}
                    </Box>
                </Fade>
            )}
        </Box>
    );
}
