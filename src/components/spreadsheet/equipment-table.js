/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo, useCallback } from 'react';
import { useTheme } from '@mui/styles';
import LoaderWithOverlay from '../utils/loader-with-overlay';
import { ALLOWED_KEYS } from './utils/config-tables';
import { CustomAGGrid } from 'components/custom-aggrid/custom-aggrid';

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
        if (params.data?.properties) {
            let properties = Object.keys(params.data.properties);

            if (properties.length > 0) {
                return properties.length > 1
                    ? DEFAULT_ROW_HEIGHT_WITH_PROPERTIES
                    : DEFAULT_ROW_HEIGHT;
            }
        } else {
            return params.node.rowPinned
                ? PINNED_ROW_HEIGHT
                : DEFAULT_ROW_HEIGHT;
        }
    }, []);

    return (
        <>
            {!fetched ? (
                <div>
                    <LoaderWithOverlay
                        color="inherit"
                        loaderSize={70}
                        loadingMessageText={'LoadingRemoteData'}
                    />
                </div>
            ) : (
                <CustomAGGrid
                    ref={gridRef}
                    getRowId={getRowId}
                    rowData={rowData}
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
                />
            )}
        </>
    );
};
