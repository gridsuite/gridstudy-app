import React, { useMemo, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-material.css';

import { useTheme } from '@mui/styles';
import LoaderWithOverlay from '../util/loader-with-overlay';

export const EquipmentTable = ({
    rows,
    columns,
    scrollTop,
    gridRef,
    handleColumnDrag,
    ...props
}) => {
    const theme = useTheme();
    // DefaultColDef sets props common to all Columns
    const defaultColDef = useMemo(() => ({
        sortable: true,
    }));

    // Example of consuming Grid Event
    const cellClickedListener = useCallback((event) => {
        console.log('cellClicked', event);
    }, []);

    const getRowId = useMemo(() => {
        return (params) => params.data.id;
    }, []);

    useEffect(() => {
        gridRef.current.api?.ensureIndexVisible(scrollTop, 'top');
        gridRef.current.api?.setFocusedCell(scrollTop);
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
                            rowData={rows}
                            columnDefs={columns}
                            defaultColDef={defaultColDef}
                            animateRows={true}
                            rowSelection="multiple"
                            onCellClicked={cellClickedListener}
                            suppressPropertyNamesCheck={true}
                            getRowStyle={getRowStyle}
                            enableCellTextSelection={true}
                            getRowId={getRowId}
                            onColumnMoved={handleColumnDrag}
                        />
                    </div>
                </div>
            )}
        </>
    );
};
