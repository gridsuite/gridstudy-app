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
import { CurrentTreeNode } from '../../redux/reducer';
import { suppressEventsToPreventEditMode } from '../dialogs/commons/utils';
import { NodeType } from 'components/graph/tree-node.type';

const DEFAULT_ROW_HEIGHT = 28;
const MAX_CLICK_DURATION = 200;

const getRowId = (params: GetRowIdParams<{ id: string }>) => params.data.id;

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

    const getRowStyle = useCallback(
        (params: RowClassParams): RowStyle | undefined => {
            const isRootNode = currentNode?.type === NodeType.ROOT;
            const cursorStyle = isRootNode ? 'initial' : 'pointer';

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
        [currentNode?.type, theme.palette.primary.main]
    );

    const gridContext = useMemo(
        () => ({
            theme,
            currentNode: currentNode,
            studyUuid: studyUuid,
        }),
        [currentNode, studyUuid, theme]
    );

    const rowsToShow = useMemo(() => (fetched && rowData.length > 0 ? rowData : []), [rowData, fetched]);

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

    const handleRowClicked = useCallback(
        (event: RowClickedEvent) => {
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
            getRowId={getRowId}
            rowData={rowsToShow}
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
