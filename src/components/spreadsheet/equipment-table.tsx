/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, Ref, useCallback, useMemo, useRef } from 'react';
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
} from 'ag-grid-community';
import { CurrentTreeNode, AppState } from '../../redux/reducer';
import { suppressEventsToPreventEditMode } from '../dialogs/commons/utils';
import { NodeType } from 'components/graph/tree-node.type';
import { useSelector } from 'react-redux';
import { getDisplayedRowData, generateCalculationRows, CalculationRowType } from './utils/calculation-utils';

// Constants
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

// Props interface
interface EquipmentTableProps {
    rowData: unknown[];
    columnData: ColDef[];
    gridRef: Ref<any> | undefined;
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

// Main equipment table component
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

    // Get the current table UUID from columnData context
    const tableUuid = useMemo(() => columnData[0]?.context?.tabUuid || '', [columnData]);

    // Get calculation selections from Redux store
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

    // Grid context
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

    // Loading message parameters
    const loadingOverlayComponentParams = useMemo(
        () => ({
            loadingMessage: intl.formatMessage({ id: 'LoadingRemoteData' }),
        }),
        [intl]
    );

    // Handler for cell mouse down events
    const handleCellMouseDown = useCallback(() => {
        clickTimeRef.current = Date.now();
    }, []);

    // Handler for row click events
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

    // Create pinned bottom rows with calculations
    const pinnedBottomRows = useMemo(() => {
        // Early return if no calculations or data
        if (!calculationSelections.length || !fetched || !rowData.length) {
            return [{ rowType: CalculationRowType.CALCULATION_BUTTON }];
        }

        // Get data to process: filtered data from grid if available, otherwise all rows
        let dataToProcess = rowData;

        if (gridRef && 'current' in gridRef && gridRef.current?.api) {
            const displayedRows = getDisplayedRowData(gridRef.current.api);
            if (displayedRows.length > 0) {
                dataToProcess = displayedRows;
            }
        }

        // Generate calculation rows
        return generateCalculationRows(calculationSelections, columnData, dataToProcess);
    }, [calculationSelections, columnData, rowData, fetched, gridRef]);

    return (
        <CustomAGGrid
            ref={gridRef}
            rowSelection={{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }}
            getRowId={getRowId}
            rowData={rowsToShow}
            pinnedBottomRowData={pinnedBottomRows}
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
