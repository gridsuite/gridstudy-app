import React, { useMemo, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-material.css';

import { makeStyles, useTheme } from '@mui/styles';
import LoaderWithOverlay from '../util/loader-with-overlay';
import localeText from 'translations/ag-grid-fr';
import { useIntl } from 'react-intl';
import { LANG_FRENCH } from '@gridsuite/commons-ui';
import localeFrench from 'translations/ag-grid-fr';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    grid: {
        width: 'auto',
        height: '100%',
    },
}));

export const EquipmentTable = ({
    rows,
    editingData,
    startEditing,
    columns,
    scrollTop,
    gridRef,
    handleColumnDrag,
    handleRowEditing,
    handleCellEditing,
    handleEditingStopped,
    ...props
}) => {
    const classes = useStyles();
    const theme = useTheme();
    const intl = useIntl();

    const getRowStyle = useCallback(
        (params) => {
            if (params.rowIndex === scrollTop) {
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
        [scrollTop, theme.palette.primary.main, theme.selectedRow.background]
    );

    const getLocaleText = useCallback(
        (params) => {
            if (intl.locale === LANG_FRENCH) {
                return localeText.hasOwnProperty(params.key)
                    ? localeFrench[params.key]
                    : params.defaultValue;
            } else {
                return params.defaultValue;
            }
        },
        [intl.locale]
    );

    useEffect(() => {
        if (scrollTop) {
            gridRef.current.api?.ensureIndexVisible(scrollTop, 'top');
        }
    }, [gridRef, scrollTop]);

    const getRowId = useMemo(() => {
        return (params) => params.data.id;
    }, []);

    //we filter enter key event to prevent closing edit mode
    const suppressEnter = (params) => {
        const filteredKeys = ['Enter', 'Tab'];
        return filteredKeys.includes(params.event.key);
    };

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: true,
            lockPinned: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            suppressKeyboardEvent: (params) => suppressEnter(params),
        }),
        []
    );

    return (
        <>
            {!props.fetched && (
                <LoaderWithOverlay
                    color="inherit"
                    loaderSize={70}
                    loadingMessageText={'LoadingRemoteData'}
                />
            )}
            {props.fetched && (
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
                            network: props.network,
                            editErrors: {},
                            startEditing: startEditing,
                        }}
                    />
                </div>
            )}
        </>
    );
};
