import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import 'ag-grid-community/styles/ag-theme-material.css'; // Optional theme CSS

import { makeStyles, useTheme } from '@mui/styles';
import LoaderWithOverlay from '../util/loader-with-overlay';
import clsx from 'clsx';
import { DARK_THEME, LIGHT_THEME } from '@gridsuite/commons-ui';

export const EquipmentTableAG = ({
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

    // Example using Grid's API
    const buttonListener = useCallback(
        (e) => {
            gridRef.current.api.deselectAll();
        },
        [gridRef]
    );

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
                    {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
                    <div
                        className={theme.aggrid}
                        style={{ width: 'auto', height: '100%' }}
                    >
                        <AgGridReact
                            ref={gridRef} // Ref for accessing Grid's API
                            rowData={rows} // Row Data for Rows
                            columnDefs={columns} // Column Defs for Columns
                            defaultColDef={defaultColDef} // Default Column Properties
                            animateRows={true} // Optional - set to 'true' to have rows animate when sorted
                            rowSelection="multiple" // Options - allows click selection of rows
                            onCellClicked={cellClickedListener} // Optional - registering for Grid Event
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
