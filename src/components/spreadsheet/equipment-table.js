import React, { useMemo, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-material.css';

import { useTheme } from '@mui/styles';
import LoaderWithOverlay from '../util/loader-with-overlay';
import localeText from 'translations/ag-grid-fr';
import { useIntl } from 'react-intl';
import { LANG_FRENCH } from '@gridsuite/commons-ui';
import localeFrench from 'translations/ag-grid-fr';

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
    const theme = useTheme();
    const intl = useIntl();

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
            suppressKeyboardEvent: (params) => suppressEnter(params),
        }),
        []
    );

    const getRowId = useMemo(() => {
        return (params) => params.data.id;
    }, []);

    useEffect(() => {
        gridRef.current.api?.ensureIndexVisible(scrollTop, 'top');
    }, [gridRef, scrollTop]);

    const getRowStyle = useCallback(
        (params) => {
            if (params.rowIndex === scrollTop) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [scrollTop, theme.selectedRow.background]
    );

    const onFirstDataRendered = useCallback(() => {
        const allColumnIds = [];
        gridRef.current.columnApi.getColumns().forEach((column) => {
            allColumnIds.push(column.getId());
        });
        gridRef.current.columnApi.autoSizeColumns(allColumnIds, false);
    }, [gridRef]);

    const getLocaleText = useCallback(
        (params) => {
            //if (!localeText.hasOwnProperty(params.key)) console.log(params);
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
                <div style={{ height: '100%' }}>
                    <div
                        className={theme.aggrid}
                        style={{ width: 'auto', height: '100%' }}
                    >
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
                            onFirstDataRendered={onFirstDataRendered}
                            onCellClicked={handleCellClicked}
                            undoRedoCellEditing={true}
                            editType={'fullRow'}
                            onCellValueChanged={handleCellEditing}
                            onRowValueChanged={handleRowEditing}
                            onRowEditingStopped={handleEditingStopped}
                            stopEditingWhenCellsLoseFocus={true}
                            suppressDragLeaveHidesColumns={true}
                            suppressPropertyNamesCheck={true}
                            suppressColumnVirtualisation={true}
                            suppressClickEdit={true}
                            getLocaleText={getLocaleText}
                        />
                    </div>
                </div>
            )}
        </>
    );
};
