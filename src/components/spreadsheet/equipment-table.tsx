/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo, useRef } from 'react';
import { useTheme } from '@mui/material';
import { useIntl } from 'react-intl';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import {
    ColDef,
    ColumnMovedEvent,
    GetRowIdParams,
    GridOptions,
    RowClassParams,
    RowClickedEvent,
    RowStyle,
} from 'ag-grid-community';
import { AppState } from '../../redux/reducer';
import { suppressEventsToPreventEditMode } from '../dialogs/commons/utils';
import { CurrentTreeNode, NodeType } from 'components/graph/tree-node.type';
import { CalculationRowType } from './utils/calculation.type';
import { isCalculationRow } from './utils/calculation-utils';
import { useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';

const DEFAULT_ROW_HEIGHT = 28;
const MAX_CLICK_DURATION = 200;

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
    gridRef: React.RefObject<AgGridReact>;
    columnData: ColDef[];
    currentNode: CurrentTreeNode;
    handleColumnDrag: (e: ColumnMovedEvent) => void;
    isFetching: boolean | undefined;
    shouldHidePinnedHeaderRightBorder: boolean;
    onRowClicked?: (event: RowClickedEvent) => void;
    isExternalFilterPresent: GridOptions['isExternalFilterPresent'];
    doesExternalFilterPass: GridOptions['doesExternalFilterPass'];
    onModelUpdated?: GridOptions['onModelUpdated'];
    isDataEditable: boolean;
    onFirstDataRendered: GridOptions['onFirstDataRendered'];
    onGridReady: GridOptions['onGridReady'];
}

export const EquipmentTable: FunctionComponent<EquipmentTableProps> = ({
    columnData,
    gridRef,
    currentNode,
    handleColumnDrag,
    isFetching,
    shouldHidePinnedHeaderRightBorder,
    onRowClicked,
    isExternalFilterPresent,
    doesExternalFilterPass,
    onModelUpdated,
    isDataEditable,
    onFirstDataRendered,
    onGridReady,
}) => {
    const theme = useTheme();
    const intl = useIntl();
    const clickTimeRef = useRef<number | null>(null);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const getRowStyle = useCallback(
        (params: RowClassParams): RowStyle | undefined => {
            const isRootNode = currentNode?.type === NodeType.ROOT;
            const cursorStyle = isRootNode || !isDataEditable ? 'initial' : 'pointer';

            if (isCalculationRow(params.data?.rowType)) {
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
        [currentNode?.type, theme, isDataEditable]
    );

    const gridContext = useMemo(
        () => ({
            theme,
            currentNode: currentNode,
            studyUuid: studyUuid,
        }),
        [currentNode, studyUuid, theme]
    );

    const handleCellMouseDown = useCallback(() => {
        clickTimeRef.current = Date.now();
    }, []);

    const handleRowClicked = useCallback(
        (event: RowClickedEvent) => {
            // Prevent row click event on pinned rows
            if (isCalculationRow(event.node.data?.rowType)) {
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

    return (
        <CustomAGGrid
            ref={gridRef}
            rowSelection={{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }}
            getRowId={getRowId}
            debounceVerticalScrollbar={true}
            getRowStyle={getRowStyle}
            columnDefs={columnData}
            defaultColDef={defaultColDef}
            undoRedoCellEditing={true}
            onColumnMoved={handleColumnDrag}
            suppressDragLeaveHidesColumns={true}
            suppressColumnVirtualisation={true}
            onCellMouseDown={handleCellMouseDown}
            onRowClicked={handleRowClicked}
            onModelUpdated={onModelUpdated}
            context={gridContext}
            shouldHidePinnedHeaderRightBorder={shouldHidePinnedHeaderRightBorder}
            rowHeight={DEFAULT_ROW_HEIGHT}
            loading={isFetching}
            overlayLoadingTemplate={intl.formatMessage({ id: 'LoadingRemoteData' })}
            isExternalFilterPresent={isExternalFilterPresent}
            doesExternalFilterPass={doesExternalFilterPass}
            onFirstDataRendered={onFirstDataRendered}
            onGridReady={onGridReady}
        />
    );
};
