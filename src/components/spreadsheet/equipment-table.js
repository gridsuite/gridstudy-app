import React, { useMemo, useCallback, useEffect, useState } from 'react';
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
    columns,
    scrollTop,
    gridRef,
    handleColumnDrag,
    handleRowEditing,
    handleCellEditing,
    handleCellClicked,
    handleEditingStopped,
    ...props
}) => {
    const classes = useStyles();
    const theme = useTheme();
    const intl = useIntl();

    const [editErrors, setEditErrors] = useState({});

    const startEditing = useCallback(() => {
        const topRow = gridRef.current?.api?.getPinnedTopRow(0);
        if (topRow) {
            gridRef.current.api?.startEditingCell({
                rowIndex: topRow.rowIndex,
                colKey: 'edit',
                rowPinned: topRow.rowPinned,
            });
        }
    }, [gridRef]);

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

    const handleRowEditingStarted = useCallback(() => {
        // console.log('######### - DEBUG TAG - #########');
        // setIsEditing(true);
    }, []);

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
        var KEY_ENTER = 'Enter';
        var event = params.event;
        var key = event.key;
        var suppress = key === KEY_ENTER;
        return suppress;
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
                        pinnedTopRowData={
                            editingData ? [editingData] : undefined
                        }
                        getRowStyle={getRowStyle}
                        columnDefs={columns}
                        defaultColDef={defaultColDef}
                        onColumnMoved={handleColumnDrag}
                        enableCellTextSelection={true}
                        alwaysMultiSort={true}
                        onCellClicked={handleCellClicked}
                        undoRedoCellEditing={true}
                        editType={'fullRow'}
                        onCellValueChanged={handleCellEditing}
                        onRowValueChanged={handleRowEditing}
                        onRowEditingStopped={handleEditingStopped}
                        onRowEditingStarted={handleRowEditingStarted}
                        suppressDragLeaveHidesColumns={true}
                        suppressPropertyNamesCheck={true}
                        suppressColumnVirtualisation={true}
                        suppressClickEdit={true}
                        getLocaleText={getLocaleText}
                        context={{
                            network: props.network,
                            editErrors: editErrors,
                            startEditing: startEditing,
                            setEditErrors: setEditErrors,
                        }}
                    />
                </div>
            )}
        </>
    );
};
