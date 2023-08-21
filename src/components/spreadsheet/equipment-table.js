/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo, useCallback } from 'react';
import { useTheme } from '@mui/material';
import { ALLOWED_KEYS } from './utils/config-tables';
import { CustomAGGrid } from 'components/custom-aggrid/custom-aggrid';
import { useIntl } from 'react-intl';

const PINNED_ROW_HEIGHT = 42;
const DEFAULT_ROW_HEIGHT = 28;
const DEFAULT_ROW_HEIGHT_WITH_PROPERTIES = 65;

export const EquipmentTable = ({
    rowData,
    topPinnedData,
    columnData,
    scrollToIndex,
    gridRef,
    handleColumnDrag,
    handleRowEditing,
    handleCellEditing,
    handleEditingStopped,
    handleGridReady,
    handleRowDataUpdated,
    handleBodyScroll,
    fetched,
    network,
    shouldHidePinnedHeaderRightBorder,
}) => {
    const theme = useTheme();
    const intl = useIntl();
    const getRowStyle = useCallback(
        (params) => {
            if (params.rowIndex === scrollToIndex) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            } else if (
                params.rowIndex === 0 &&
                params.node.rowPinned === 'top'
            ) {
                return {
                    borderTop: '1px solid ' + theme.palette.primary.main,
                    borderBottom: '1px solid ' + theme.palette.primary.main,
                };
            }
        },
        [
            scrollToIndex,
            theme.palette.primary.main,
            theme.selectedRow.background,
        ]
    );

    const getRowId = useCallback((params) => params.data.id, []);

    //we filter enter key event to prevent closing or opening edit mode
    const suppressKeyEvent = (params) => {
        return !ALLOWED_KEYS.includes(params.event.key);
    };

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: true,
            lockPinned: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            suppressKeyboardEvent: (params) => suppressKeyEvent(params),
        }),
        []
    );

    const gridContext = useMemo(() => {
        return {
            network: network,
            editErrors: {},
            dynamicValidation: {},
            isEditing: topPinnedData ? true : false,
        };
    }, [network, topPinnedData]);

    const getRowHeight = useCallback((params) => {
        const propertiesLength = params.data?.properties
            ? Object.keys(params.data.properties).length
            : 0;

        if (propertiesLength > 1) {
            return DEFAULT_ROW_HEIGHT_WITH_PROPERTIES;
        }
        if (propertiesLength === 1) {
            return DEFAULT_ROW_HEIGHT;
        }
        if (params.node.rowPinned) {
            return PINNED_ROW_HEIGHT;
        } else {
            return DEFAULT_ROW_HEIGHT;
        }
    }, []);

    const rowsToShow = useMemo(() => {
        return fetched && rowData.length > 0 ? rowData : [];
    }, [rowData, fetched]);

    const message = useMemo(() => {
        if (!fetched) {
            return intl.formatMessage({ id: 'LoadingRemoteData' });
        }
        if (fetched && rowData.length === 0) {
            return intl.formatMessage({ id: 'grid.noRowsToShow' });
        }
        return undefined;
    }, [rowData, fetched, intl]);

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
            enableCellTextSelection={true}
            undoRedoCellEditing={true}
            editType={'fullRow'}
            onCellValueChanged={handleCellEditing}
            onRowValueChanged={handleRowEditing}
            onRowDataUpdated={handleRowDataUpdated}
            onRowEditingStopped={handleEditingStopped}
            onColumnMoved={handleColumnDrag}
            suppressDragLeaveHidesColumns={true}
            suppressColumnVirtualisation={true}
            suppressClickEdit={true}
            context={gridContext}
            onGridReady={handleGridReady}
            onBodyScroll={handleBodyScroll}
            shouldHidePinnedHeaderRightBorder={
                shouldHidePinnedHeaderRightBorder
            }
            getRowHeight={getRowHeight}
            overlayNoRowsTemplate={message}
        />
    );
};
