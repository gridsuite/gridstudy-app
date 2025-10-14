/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { AgGridReact } from 'ag-grid-react';
import { type ReactElement, type RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { debounce } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';
import { type FilterChangedEvent, type ModelUpdatedEvent, type RowDataUpdatedEvent } from 'ag-grid-community';

type UseFilteredRowCounterInfoParams = {
    gridRef: RefObject<AgGridReact | null>;
    tableDefinition: SpreadsheetTabDefinition;
    disabled: boolean;
};

export type UseFilteredRowCounterInfoReturn = {
    isLoading: boolean;
    isAnyFilterPresent: boolean;
    rowCountLabel: string | undefined;
    tooltipContent: ReactElement | undefined;
    registerRowCounterEvents: (params: RowDataUpdatedEvent) => void;
    displayedRows: number | null;
};

export function useFilteredRowCounterInfo({
    gridRef,
    tableDefinition,
    disabled,
}: UseFilteredRowCounterInfoParams): UseFilteredRowCounterInfoReturn {
    const intl = useIntl();
    const [displayedRows, setDisplayedRows] = useState<number | null>(null);
    const [totalRows, setTotalRows] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnyFilterPresent, setIsAnyFilterPresent] = useState(false);

    const equipments = useSelector((state: AppState) => state.spreadsheetNetwork.equipments[tableDefinition?.type]);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const globalFilterSpreadsheetState = useSelector(
        (state: AppState) => state.globalFilterSpreadsheetState[tableDefinition.uuid]
    );
    const spreadsheetColumnsFiltersState = useSelector(
        (state: AppState) => state.spreadsheetFilter[tableDefinition?.uuid]
    );

    // Update is debounced to avoid displayed row count falsely set to 0 because of AG Grid internal behaviour which briefly set row count to 0 in between filters
    const debouncedUpdateRowCounter = useMemo(
        () =>
            debounce(() => {
                if (!gridRef.current?.api || !currentNode || disabled) {
                    setDisplayedRows(0);
                    setTotalRows(0);
                    setIsLoading(false);
                    return;
                }
                const api = gridRef.current.api;
                setDisplayedRows(api.getDisplayedRowCount());
                setTotalRows(Object.values(equipments.equipmentsByNodeId[currentNode.id] ?? {}).length ?? 0);
                setIsLoading(false);
            }, 600),
        [gridRef, currentNode, disabled, equipments.equipmentsByNodeId]
    );

    const onFilterChanged = useCallback((event: FilterChangedEvent) => {
        setIsAnyFilterPresent(event.api.isAnyFilterPresent());
        setIsLoading(true);
    }, []);

    const onModelUpdated = useCallback(
        (event: ModelUpdatedEvent) => {
            setIsAnyFilterPresent(event.api.isAnyFilterPresent());
            debouncedUpdateRowCounter();
        },
        [debouncedUpdateRowCounter]
    );

    const registerRowCounterEvents = useCallback(
        (params: RowDataUpdatedEvent) => {
            params.api.addEventListener('filterChanged', onFilterChanged);
            params.api.addEventListener('modelUpdated', onModelUpdated);

            //Initial display of counter
            debouncedUpdateRowCounter();
            setIsAnyFilterPresent(params.api.isAnyFilterPresent());
        },
        [debouncedUpdateRowCounter, onFilterChanged, onModelUpdated]
    );

    useEffect(() => {
        if (disabled || !currentNode || gridRef.current?.api?.isRowDataEmpty()) {
            debouncedUpdateRowCounter();
        }
    }, [currentNode, debouncedUpdateRowCounter, disabled, gridRef]);

    const rowCountLabel = useMemo(() => {
        if (displayedRows === 0 && isAnyFilterPresent) {
            return intl.formatMessage({ id: 'NoMatch' });
        } else {
            const plural = intl.formatMessage({ id: 'Rows' }, { count: totalRows });
            return displayedRows === totalRows ? `${totalRows} ${plural}` : `${displayedRows} / ${totalRows} ${plural}`;
        }
    }, [displayedRows, totalRows, intl, isAnyFilterPresent]);

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
            for (const [filterType, labels] of Object.entries(gsFilterByType)) {
                const formattedLabels = labels.map((label) => intl.formatMessage({ id: label })).join(', ');
                lines.push(`- ${intl.formatMessage({ id: filterType })} : "${formattedLabels}"`);
            }
        }

        if (spreadsheetColumnsFiltersState?.length > 0) {
            lines.push(`${intl.formatMessage({ id: 'ColumnsFilters' })} : `);
            for (const filterModel of spreadsheetColumnsFiltersState) {
                const headerName =
                    gridRef.current?.api.getColumn(filterModel.column)?.getColDef()?.headerName ?? filterModel.column;
                lines.push(
                    `- ${headerName} : ${intl.formatMessage({ id: 'filter.' + filterModel.type })} "${filterModel.value}"`.replaceAll(
                        ',',
                        ', '
                    )
                );
            }
        }
        return <span style={{ whiteSpace: 'pre-line' }}>{lines.join('\n')}</span>;
    }, [globalFilterSpreadsheetState, gridRef, intl, isAnyFilterPresent, isLoading, spreadsheetColumnsFiltersState]);

    const tooltipContent = useMemo(
        () =>
            isAnyFilterPresent ? (
                filtersSummary
            ) : (
                <span style={{ whiteSpace: 'pre-line' }}>{intl.formatMessage({ id: 'RowCounterInfo' })}</span>
            ),
        [filtersSummary, intl, isAnyFilterPresent]
    );

    return {
        isLoading,
        isAnyFilterPresent,
        rowCountLabel,
        tooltipContent,
        registerRowCounterEvents,
        displayedRows,
    };
}
