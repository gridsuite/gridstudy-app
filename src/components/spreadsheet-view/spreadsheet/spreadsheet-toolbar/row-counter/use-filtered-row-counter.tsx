/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { AgGridReact } from 'ag-grid-react';
import { type RefObject, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { debounce } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';

type UseFilteredRowCounterInfoParams = {
    gridRef: RefObject<AgGridReact>;
    tableDefinition: SpreadsheetTabDefinition;
    disabled: boolean;
};

export function useFilteredRowCounterInfo({ gridRef, tableDefinition, disabled }: UseFilteredRowCounterInfoParams) {
    const intl = useIntl();
    const [displayedRows, setDisplayedRows] = useState<number | null>(null);
    const [totalRows, setTotalRows] = useState<number | null>(null);
    const [isLoading, setLoading] = useState(true);

    const equipments = useSelector((state: AppState) => state.spreadsheetNetwork[tableDefinition?.type]);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const globalFilterSpreadsheetState = useSelector(
        (state: AppState) => state.globalFilterSpreadsheetState[tableDefinition.uuid]
    );
    const spreadsheetColumnsFiltersState = useSelector(
        (state: AppState) => state.spreadsheetFilter[tableDefinition?.uuid]
    );

    const isAnyFilterPresent = gridRef.current?.api?.isAnyFilterPresent() ?? false;

    // Update is debounced to avoid displayed row count falsely set to 0 because of AG Grid internal behaviour which briefly set row count to 0 in between filters
    const debouncedUpdateRowCount = useMemo(
        () =>
            debounce(() => {
                if (!gridRef.current?.api || !currentNode || disabled) {
                    setDisplayedRows(0);
                    setTotalRows(0);
                    setLoading(false);
                    return;
                }
                const api = gridRef.current.api;
                setDisplayedRows(api.getDisplayedRowCount());
                setTotalRows(equipments.equipmentsByNodeId[currentNode.id]?.length ?? 0);
                setLoading(false);
            }, 600),
        [gridRef, currentNode, disabled, equipments.equipmentsByNodeId]
    );

    useEffect(() => {
        const api = gridRef.current?.api;
        if (!api || !currentNode) {
            if (disabled) {
                debouncedUpdateRowCount();
            }
            return;
        }
        const onFilterChanged = () => setLoading(true);
        const onModelUpdated = () => debouncedUpdateRowCount();
        //Initial row count display
        debouncedUpdateRowCount();
        api.addEventListener('filterChanged', onFilterChanged);
        api.addEventListener('modelUpdated', onModelUpdated);

        return () => {
            api.removeEventListener('filterChanged', onFilterChanged);
            api.removeEventListener('modelUpdated', onModelUpdated);
        };
    }, [gridRef, currentNode, debouncedUpdateRowCount, disabled]);

    const rowCountLabel = useMemo(() => {
        if (isLoading || displayedRows === null || totalRows === null) {
            return;
        }
        const plural = `${intl.formatMessage({ id: 'Rows' })}${totalRows === 1 ? '' : 's'}`;
        if (displayedRows === 0 && totalRows > 0) {
            return intl.formatMessage({ id: 'NoMatch' });
        } else {
            return displayedRows !== totalRows ? `${displayedRows} / ${totalRows} ${plural}` : `${totalRows} ${plural}`;
        }
    }, [isLoading, displayedRows, totalRows, intl]);

    const filtersSummary = useMemo(() => {
        if (isLoading || !isAnyFilterPresent) {
            return;
        }

        const gsFilterByType = globalFilterSpreadsheetState?.reduce<Record<string, string[]>>((acc, item) => {
            acc[item.filterType] = acc[item.filterType] || [];
            acc[item.filterType].push(item.label);
            return acc;
        }, {});

        const lines: string[] = [`${intl.formatMessage({ id: 'ClickToReset' })}`];
        if (Object.keys(gsFilterByType)?.length > 0) {
            lines.push(`${intl.formatMessage({ id: 'ExternalFilters' })} : `);

            Object.entries(gsFilterByType).forEach(([filterType, labels]) => {
                const formattedLabels = labels.map((label) => intl.formatMessage({ id: label })).join(', ');
                lines.push(`- ${intl.formatMessage({ id: filterType })} : "${formattedLabels}"`);
            });
        }

        if (spreadsheetColumnsFiltersState && spreadsheetColumnsFiltersState.length > 0) {
            lines.push(`${intl.formatMessage({ id: 'ColumnsFilters' })} : `);
            spreadsheetColumnsFiltersState.forEach((filterModel) => {
                const headerName =
                    gridRef.current?.api.getColumn(filterModel.column)?.getColDef()?.headerName ?? filterModel.column;
                console.log(filterModel);
                lines.push(
                    `- ${headerName} : ${intl.formatMessage({ id: 'filter.' + filterModel.type })} "${filterModel.value}"`.replaceAll(
                        ',',
                        ', '
                    )
                );
            });
        }
        return <span style={{ whiteSpace: 'pre-line' }}>{lines.join('\n')}</span>;
    }, [globalFilterSpreadsheetState, gridRef, intl, isAnyFilterPresent, isLoading, spreadsheetColumnsFiltersState]);

    const tooltipContent = useMemo(
        () => (isAnyFilterPresent ? filtersSummary : intl.formatMessage({ id: 'RowCounterInfo' })),
        [filtersSummary, intl, isAnyFilterPresent]
    );

    return {
        isLoading,
        isAnyFilterPresent,
        rowCountLabel,
        tooltipContent,
    };
}
