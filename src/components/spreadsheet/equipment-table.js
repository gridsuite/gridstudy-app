/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-material.css';

import { makeStyles, useTheme } from '@mui/styles';
import LoaderWithOverlay from '../util/loader-with-overlay';
import { useIntl } from 'react-intl';
import { LANG_FRENCH } from '@gridsuite/commons-ui';
import localeFrench from 'translations/ag-grid-fr';
import clsx from 'clsx';
import { ALLOWED_KEYS } from './utils/config-tables';

const useStyles = makeStyles((theme) => ({
    grid: {
        width: 'auto',
        height: '100%',
    },
}));

export const EquipmentTable = ({
    rows,
    editingData,
    columns,
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
            return intl.locale === LANG_FRENCH &&
                localeFrench.hasOwnProperty(params.key)
                ? localeFrench[params.key]
                : params.defaultValue;
        },
        [intl.locale]
    );

    const getRowId = useMemo(() => {
        return (params) => params.data.id;
    }, []);

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

    return (
        <>
            {!fetched ? (
                <LoaderWithOverlay
                    color="inherit"
                    loaderSize={70}
                    loadingMessageText={'LoadingRemoteData'}
                />
            ) : (
                <div className={clsx([theme.aggrid, classes.grid])}>
                    <AgGridReact
                        ref={gridRef}
                        getRowId={getRowId}
                        rowData={rows}
                        pinnedTopRowData={editingData}
                        getRowStyle={getRowStyle}
                        columnDefs={columns}
                        defaultColDef={defaultColDef}
                        enableCellTextSelection={true}
                        alwaysMultiSort={true}
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
                        context={{
                            network: network,
                            editErrors: {},
                            dynamicValidation: {},
                            isEditing: editingData ? true : false,
                        }}
                    />
                </div>
            )}
        </>
    );
};
