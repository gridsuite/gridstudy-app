/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo, useCallback, useState } from 'react';
import { useTheme } from '@mui/material';
import { ALLOWED_KEYS } from './utils/config-tables';
import { CustomAGGrid } from 'components/custom-aggrid/custom-aggrid';
import { useIntl } from 'react-intl';
import SitePropertiesDialog from 'components/dialogs/equipements-table/site-properties-dialog';
import { SelectOptionsDialog } from 'utils/dialogs';
import {
    modifySubstation,
    formatPropertiesForBackend,
} from 'services/study/network-modifications';

const PINNED_ROW_HEIGHT = 42;
const DEFAULT_ROW_HEIGHT = 28;

export const EquipmentTable = ({
    rowData,
    topPinnedData,
    columnData,
    gridRef,
    studyUuid,
    currentNode,
    equipmentId,
    equipmentType,
    handleColumnDrag,
    handleRowEditing,
    handleCellEditing,
    handleEditingStarted,
    handleEditingStopped,
    handleGridReady,
    handleRowDataUpdated,
    fetched,
    network,
    shouldHidePinnedHeaderRightBorder,
}) => {
    const theme = useTheme();
    const intl = useIntl();
    const [openPopupEditSiteProperties, setOpenPopupEditSiteProperties] =
        useState(false);

    const getRowStyle = useCallback(
        (params) => {
            if (params.rowIndex === 0 && params.node.rowPinned === 'top') {
                return {
                    borderTop: '1px solid ' + theme.palette.primary.main,
                    borderBottom: '1px solid ' + theme.palette.primary.main,
                };
            }
        },
        [theme.palette.primary.main]
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
            handleCellClick: {
                //functions for handling cell click
                openPropertiesDialog: () => {
                    openPropertiesEditionPopup();
                },
            },
        };
    }, [network, topPinnedData]);
    const getRowHeight = useCallback(
        (params) =>
            params.node.rowPinned ? PINNED_ROW_HEIGHT : DEFAULT_ROW_HEIGHT,
        []
    );

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

    const loadingOverlayComponent = (props) => {
        return <>{props.loadingMessage}</>;
    };
    const loadingOverlayComponentParams = useMemo(() => {
        return {
            loadingMessage: intl.formatMessage({ id: 'LoadingRemoteData' }),
        };
    }, [intl]);

    const openPropertiesEditionPopup = () => {
        setOpenPopupEditSiteProperties(true);
    };

    return (
        <>
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
                onRowEditingStarted={handleEditingStarted}
                onRowEditingStopped={handleEditingStopped}
                onColumnMoved={handleColumnDrag}
                suppressDragLeaveHidesColumns={true}
                suppressColumnVirtualisation={true}
                suppressClickEdit={true}
                context={gridContext}
                onGridReady={handleGridReady}
                shouldHidePinnedHeaderRightBorder={
                    shouldHidePinnedHeaderRightBorder
                }
                getRowHeight={getRowHeight}
                overlayNoRowsTemplate={message}
                loadingOverlayComponent={loadingOverlayComponent}
                loadingOverlayComponentParams={loadingOverlayComponentParams}
                showOverlay={true}
            />

            <SitePropertiesDialog
                open={openPopupEditSiteProperties}
                spreadsheetContext={gridContext}
                closeDialog={(state) => setOpenPopupEditSiteProperties(state)}
            ></SitePropertiesDialog>
        </>
    );
};
