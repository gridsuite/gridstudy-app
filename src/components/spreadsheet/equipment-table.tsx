/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, RefObject, useCallback, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material';
import { useIntl } from 'react-intl';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import {
    ColDef,
    ColumnMovedEvent,
    GetRowIdParams,
    RowClassParams,
    RowClickedEvent,
    GridOptions,
    RowStyle,
    RowNode,
} from 'ag-grid-community';
import { CurrentTreeNode, AppState } from '../../redux/reducer';
import { suppressEventsToPreventEditMode } from '../dialogs/commons/utils';
import { NodeType } from 'components/graph/tree-node.type';
import { useSelector } from 'react-redux';
import { generateCalculationRows, CalculationRowType } from './utils/calculation-utils';

const DEFAULT_ROW_HEIGHT = 28;
const MAX_CLICK_DURATION = 200;

// Row data interface
interface RowData {
    id: string;
    rowType?: string;
    calculationType?: string;
}

// Handle row IDs for regular and calculation rows
const getRowId = (params: GetRowIdParams<RowData>) => {
    if (params.data.rowType) {
        return params.data.rowType + (params.data.calculationType ?? '');
    }
    return params.data.id;
};

// Default column definition
const defaultColDef: ColDef = {
    filter: true,
    sortable: true,
    resizable: true,
    lockPinned: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    suppressKeyboardEvent: suppressEventsToPreventEditMode,
};

interface EquipmentTableProps {
    rowData: unknown[];
    columnData: ColDef[];
    gridRef: RefObject<any> | undefined;
    studyUuid: string;
    currentNode: CurrentTreeNode;
    handleColumnDrag: (e: ColumnMovedEvent) => void;
    handleRowDataUpdated: () => void;
    fetched: boolean;
    shouldHidePinnedHeaderRightBorder: boolean;
    onRowClicked?: (event: RowClickedEvent) => void;
    isExternalFilterPresent: GridOptions['isExternalFilterPresent'];
    doesExternalFilterPass: GridOptions['doesExternalFilterPass'];
}

const loadingOverlayComponent = (props: { loadingMessage: string }) => <>{props.loadingMessage}</>;

export const EquipmentTable: FunctionComponent<EquipmentTableProps> = ({
    rowData,
    columnData,
    gridRef,
    studyUuid,
    currentNode,
    handleColumnDrag,
    handleRowDataUpdated,
    fetched,
    shouldHidePinnedHeaderRightBorder,
    onRowClicked,
    isExternalFilterPresent,
    doesExternalFilterPass,
}) => {
    const theme = useTheme();
    const intl = useIntl();
    const clickTimeRef = useRef<number | null>(null);
    const [filteredRows, setFilteredRows] = useState<RowNode[]>([]);

    // Get the current table UUID from columnData context
    const tableUuid = useMemo(() => columnData[0]?.context?.tabUuid || '', [columnData]);

    const calculationSelections = useSelector((state: AppState) => state.calculationSelections?.[tableUuid] || []);

    // Styling for rows based on their type and position
    const getRowStyle = useCallback(
        (params: RowClassParams): RowStyle | undefined => {
            const isRootNode = currentNode?.type === NodeType.ROOT;
            const cursorStyle = isRootNode ? 'initial' : 'pointer';

            if (params.node.rowPinned === 'bottom') {
                if (params.data?.rowType === CalculationRowType.CALCULATION) {
                    return {
                        backgroundColor: theme.palette.background.default,
                        fontWeight: 'bold',
                    };
                }

                if (params.data?.rowType === CalculationRowType.CALCULATION_BUTTON) {
                    return {
                        borderTop: '1px solid ' + theme.palette.divider,
                        backgroundColor: theme.palette.action.hover,
                    };
                }
            }

            if (params.rowIndex === 0 && params.node.rowPinned === 'top') {
                return {
                    borderTop: '1px solid ' + theme.palette.primary.main,
                    borderBottom: '1px solid ' + theme.palette.primary.main,
                    cursor: cursorStyle,
                };
            }
            return {
                cursor: cursorStyle,
            };
        },
        [currentNode?.type, theme]
    );

    const gridContext = useMemo(
        () => ({
            theme,
            currentNode: currentNode,
            studyUuid: studyUuid,
        }),
        [currentNode, studyUuid, theme]
    );

    // Show rows only when data is ready
    const rowsToShow = useMemo(() => (fetched && rowData.length > 0 ? rowData : []), [rowData, fetched]);

    // Message for empty/loading state
    const message = useMemo(() => {
        if (!fetched) {
            return intl.formatMessage({ id: 'LoadingRemoteData' });
        }
        if (fetched && rowData.length === 0) {
            return intl.formatMessage({ id: 'grid.noRowsToShow' });
        }
        return undefined;
    }, [rowData, fetched, intl]);

    const loadingOverlayComponentParams = useMemo(
        () => ({
            loadingMessage: intl.formatMessage({ id: 'LoadingRemoteData' }),
        }),
        [intl]
    );

    const handleCellMouseDown = useCallback(() => {
        clickTimeRef.current = Date.now();
    }, []);

    // Handler for row c
    const handleRowClicked = useCallback(
        (event: RowClickedEvent) => {
            if (event.node.rowPinned === 'bottom') {
                return;
            }
            const clickDuration = Date.now() - (clickTimeRef.current ?? 0);
            if (clickDuration < MAX_CLICK_DURATION) {
                onRowClicked?.(event);
            }
            clickTimeRef.current = null;
        },
        [onRowClicked]
    );

    // Handler for external filter (GS filter) change
    const onFilterChanged = useCallback(() => {
        if (gridRef?.current?.api) {
            const filteredRows: RowNode[] = [];
            gridRef.current.api.forEachNodeAfterFilter((node: RowNode) => {
                filteredRows.push(node);
            });
            setFilteredRows(filteredRows);
        }
    }, [gridRef]);

    // Create pinned bottom rows with calculations
    const calculationRows = useMemo(() => {
        // Default fallback row - calculation button only
        const defaultRow = [{ rowType: CalculationRowType.CALCULATION_BUTTON }];

        // Early return if no calculations needed
        if (!calculationSelections.length || !fetched || !rowData.length) {
            return defaultRow;
        }

        const api = gridRef?.current?.api;
        if (!api) {
            return defaultRow;
        }

        // Use filtered rows if available, otherwise get all displayed nodes
        const nodesToUse =
            filteredRows.length > 0
                ? filteredRows
                : (() => {
                      const displayedNodes: RowNode[] = [];
                      api.forEachNodeAfterFilter((node: RowNode) => {
                          displayedNodes.push(node);
                      });
                      return displayedNodes;
                  })();

        return generateCalculationRows(calculationSelections, columnData, api, nodesToUse);
    }, [calculationSelections, fetched, rowData.length, gridRef, filteredRows, columnData]);

    return (
        <CustomAGGrid
            ref={gridRef}
            rowSelection={{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }}
            getRowId={getRowId}
            rowData={rowsToShow}
            pinnedBottomRowData={calculationRows}
            debounceVerticalScrollbar={true}
            getRowStyle={getRowStyle}
            columnDefs={columnData}
            defaultColDef={defaultColDef}
            undoRedoCellEditing={true}
            onRowDataUpdated={handleRowDataUpdated}
            onColumnMoved={handleColumnDrag}
            suppressDragLeaveHidesColumns={true}
            suppressColumnVirtualisation={true}
            onCellMouseDown={handleCellMouseDown}
            onRowClicked={handleRowClicked}
            onFilterChanged={onFilterChanged}
            context={gridContext}
            shouldHidePinnedHeaderRightBorder={shouldHidePinnedHeaderRightBorder}
            rowHeight={DEFAULT_ROW_HEIGHT}
            overlayNoRowsTemplate={message}
            loadingOverlayComponent={loadingOverlayComponent}
            loadingOverlayComponentParams={loadingOverlayComponentParams}
            showOverlay={true}
            isExternalFilterPresent={isExternalFilterPresent}
            doesExternalFilterPass={doesExternalFilterPass}
        />
    );
};
