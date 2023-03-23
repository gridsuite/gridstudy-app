/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-material.css';

import { Grid } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';
import GridQuickFilter from './curve/grid-quick-filter';
import { useCallback, useMemo, useRef, useState } from 'react';
import GridButtons from './curve/grid-buttons';
import { AgGridReact } from 'ag-grid-react';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    grid: {
        width: 'auto',
        height: '400px',
        position: 'relative',

        //overrides the default computed max height for ag grid default selector editor to make it more usable
        //can be removed if a custom selector editor is implemented
        '& .ag-select-list': {
            maxHeight: '300px !important',
        },
    },
}));

const CurveParameters = ({ dynaWaltzExtension, onUpdateCurve }) => {
    const { curves } = dynaWaltzExtension;
    const quickFilterRef = useRef();

    // curve grid configuration
    const classes = useStyles();
    const theme = useTheme();
    const gridRef = useRef();

    const containerStyle = useMemo(
        () => ({ width: '100%', height: '100%' }),
        []
    );
    const gridStyle = useMemo(() => ({ height: '300px', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        { field: 'athlete', minWidth: 150 },
        { field: 'age', maxWidth: 90 },
        { field: 'country', minWidth: 150 },
        { field: 'year', maxWidth: 90 },
    ]);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 100,
        };
    }, []);

    const onGridReady = useCallback((params) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => setRowData(data));
    }, []);

    const onSelectionChanged = useCallback(() => {
        const selectedRows = gridRef.current.api.getSelectedRows();
        document.querySelector('#selectedRows').innerHTML =
            selectedRows.length === 1 ? selectedRows[0].athlete : '';
    }, []);

    return (
        dynaWaltzExtension && (
            <>
                <Grid container item sx={{ marginBottom: theme.spacing(1) }}>
                    <GridQuickFilter
                        key={'curve-quick-filter'}
                        ref={quickFilterRef}
                        gridRef={gridRef}
                        disabled={false}
                    />
                    <GridButtons />
                </Grid>

                <div className={clsx([theme.aggrid, classes.grid])}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        rowSelection={'multiple'}
                        onGridReady={onGridReady}
                        onSelectionChanged={onSelectionChanged}
                    ></AgGridReact>
                </div>
            </>
        )
    );
};

export default CurveParameters;
