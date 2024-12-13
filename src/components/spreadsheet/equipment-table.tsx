/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, Ref, useCallback, useMemo } from 'react';
import { useTheme } from '@mui/material';
import { useIntl } from 'react-intl';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import {
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    ColDef,
    ColumnMovedEvent,
    GetRowIdParams,
    RowClassParams,
    RowHeightParams,
    RowStyle,
} from 'ag-grid-community';
import { CurrentTreeNode } from '../../redux/reducer';
import { suppressEventsToPreventEditMode } from '../dialogs/commons/utils';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';

const PINNED_ROW_HEIGHT = 42;
const DEFAULT_ROW_HEIGHT = 28;

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
    topPinnedData: unknown[] | undefined;
    columnData: ColDef[];
    gridRef: Ref<any> | undefined;
    studyUuid: string;
    currentNode: CurrentTreeNode;
    handleColumnDrag: (e: ColumnMovedEvent) => void;
    handleCellEditingStarted: (e: CellEditingStartedEvent) => void;
    handleCellEditingStopped: (e: CellEditingStoppedEvent) => void;
    handleGridReady: () => void;
    handleRowDataUpdated: () => void;
    fetched: boolean;
    shouldHidePinnedHeaderRightBorder: boolean;
    columnTypes: { [key: string]: ColDef };
}

const loadingOverlayComponent = (props: { loadingMessage: string }) => <>{props.loadingMessage}</>;

export const EquipmentTable: FunctionComponent<EquipmentTableProps> = ({
    rowData,
    topPinnedData,
    columnData,
    gridRef,
    studyUuid,
    currentNode,
    handleColumnDrag,
    handleCellEditingStarted,
    handleCellEditingStopped,
    handleGridReady,
    handleRowDataUpdated,
    fetched,
    shouldHidePinnedHeaderRightBorder,
    columnTypes,
}) => {
    const theme = useTheme();
    const intl = useIntl();
    const { translate } = useLocalizedCountries();

    const getRowStyle = useCallback(
        (params: RowClassParams): RowStyle | undefined => {
            if (params.rowIndex === 0 && params.node.rowPinned === 'top') {
                return {
                    borderTop: '1px solid ' + theme.palette.primary.main,
                    borderBottom: '1px solid ' + theme.palette.primary.main,
                };
            }
        },
        [theme.palette.primary.main]
    );

    const gridContext = useMemo(
        () => ({
            editErrors: {},
            dynamicValidation: {},
            isEditing: !!topPinnedData,
            theme,
            lastEditedField: undefined,
            dataToModify: topPinnedData ? JSON.parse(JSON.stringify(topPinnedData[0])) : {},
            currentNode: currentNode,
            studyUuid: studyUuid,
            intl: intl,
            translateCountryCode: translate,
        }),
        [currentNode, intl, studyUuid, theme, topPinnedData, translate]
    );

    const getRowHeight = useCallback(
        (params: RowHeightParams): number => (params.node.rowPinned ? PINNED_ROW_HEIGHT : DEFAULT_ROW_HEIGHT),
        []
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

    return (
        <CustomAGGrid
            ref={gridRef}
            getRowId={getRowId}
            rowData={rowsToShow}
            pinnedTopRowData={topPinnedData}
            debounceVerticalScrollbar={true}
            getRowStyle={getRowStyle}
            columnDefs={columnData}
            defaultColDef={defaultColDef}
            undoRedoCellEditing={true}
            onCellEditingStarted={handleCellEditingStarted}
            onCellEditingStopped={handleCellEditingStopped}
            onRowDataUpdated={handleRowDataUpdated}
            onColumnMoved={handleColumnDrag}
            suppressDragLeaveHidesColumns={true}
            suppressColumnVirtualisation={true}
            suppressClickEdit={!topPinnedData}
            singleClickEdit={true}
            context={gridContext}
            onGridReady={handleGridReady}
            shouldHidePinnedHeaderRightBorder={shouldHidePinnedHeaderRightBorder}
            getRowHeight={getRowHeight}
            overlayNoRowsTemplate={message}
            loadingOverlayComponent={loadingOverlayComponent}
            loadingOverlayComponentParams={loadingOverlayComponentParams}
            showOverlay={true}
            columnTypes={columnTypes}
        />
    );
};
