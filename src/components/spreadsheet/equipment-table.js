/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { makeStyles, useTheme } from '@mui/styles';
import LoaderWithOverlay from '../util/loader-with-overlay';
import { useIntl } from 'react-intl';
import clsx from 'clsx';
import { ALLOWED_KEYS } from './utils/config-tables';

const useStyles = makeStyles((theme) => ({
    grid: {
        width: 'auto',
        height: '100%',
        position: 'relative',

        //overrides the default computed max heigt for ag grid default selector editor to make it more usable
        //can be removed if a custom selector editor is implemented
        '& .ag-select-list': {
            maxHeight: '300px !important',
        },

        '& .ag-body-horizontal-scroll:not(.ag-scrollbar-invisible) .ag-horizontal-left-spacer:not(.ag-scroller-corner)':
            {
                visibility: 'hidden',
            },
    },
}));

const GRID_PREFIX = 'grid.';

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
    fetched,
    network,
}) => {
    const classes = useStyles();
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

    const getLocaleText = useCallback(
        (params) => {
            const key = GRID_PREFIX + params.key;
            return intl.messages[key] || params.defaultValue;
        },
        [intl]
    );

    const getRowId = useCallback((params) => params.data.id, []);

    //we filter enter key event to prevent closing or opening edit mode
    const suppressKeyEvent = (params) => {
        return !ALLOWED_KEYS.includes(params.event.key);
    };

    const filterIcon = useMemo(
        () => '<span class="ag-icon ag-icon-filter"/>',
        []
    );

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: true,
            lockPinned: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            suppressKeyboardEvent: (params) => suppressKeyEvent(params),
            icons: {
                menu: filterIcon,
            },
        }),
        [filterIcon]
    );

    const gridContext = useMemo(() => {
        return {
            network: network,
            editErrors: {},
            dynamicValidation: {},
            isEditing: topPinnedData ? true : false,
        };
    }, [network, topPinnedData]);

    return (
        <>
            <div className={clsx([theme.aggrid, classes.grid])}>
                {!fetched ? (
                    <LoaderWithOverlay
                        color="inherit"
                        loaderSize={70}
                        loadingMessageText={'LoadingRemoteData'}
                    />
                ) : (
                    <AgGridReact
                        ref={gridRef}
                        getRowId={getRowId}
                        rowData={rowData}
                        pinnedTopRowData={topPinnedData}
                        getRowStyle={getRowStyle}
                        columnDefs={columnData}
                        defaultColDef={defaultColDef}
                        enableCellTextSelection={true}
                        undoRedoCellEditing={true}
                        editType={'fullRow'}
                        onCellValueChanged={handleCellEditing}
                        onRowValueChanged={handleRowEditing}
                        onRowEditingStopped={handleEditingStopped}
                        onColumnMoved={handleColumnDrag}
                        suppressDragLeaveHidesColumns={true}
                        suppressPropertyNamesCheck={true}
                        suppressColumnVirtualisation={true}
                        suppressClickEdit={true}
                        getLocaleText={getLocaleText}
                        context={gridContext}
                    />
                )}
            </div>
        </>
    );
};
