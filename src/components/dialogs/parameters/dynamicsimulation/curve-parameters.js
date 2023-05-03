/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { Grid, Typography } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import GridButtons from './curve/grid-buttons';
import { AgGridReact } from 'ag-grid-react';
import clsx from 'clsx';
import { useIntl } from 'react-intl';
import CurveSelectorDialog from './curve/dialog/curve-selector-dialog';
import { GlobalFilter } from '../../../spreadsheet/global-filter';

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

const CurveParameters = ({ curves = [], onUpdateCurve }) => {
    console.log('CurveParameters re-render', curves);
    const intl = useIntl();
    const [rowData, setRowData] = useState([]);
    const [selectedRowsLength, setSelectedRowsLength] = useState(0);

    // handle open/close/save curve selector dialog
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => {
        setOpen((prevState) => !prevState);
    }, []);
    const handleSave = useCallback(
        (newCurves) => {
            // do save here
            console.log(
                'handleSave of CurveParameters is called with newCurves',
                newCurves
            );
            const notYetAddedCurves = newCurves.filter(
                (curve) =>
                    !curves.find(
                        (elem) =>
                            elem.equipmentId === curve.equipmentId &&
                            elem.variableId === curve.variableId
                    )
            );
            const newParameterCurves = [...curves, ...notYetAddedCurves];
            setRowData(newParameterCurves);
            onUpdateCurve(newParameterCurves);
            setOpen((prevState) => !prevState);
        },
        [curves, onUpdateCurve]
    );

    const quickFilterRef = useRef();

    // curve grid configuration
    const classes = useStyles();
    const theme = useTheme();
    const gridRef = useRef();

    const columnDefs = useMemo(() => {
        return [
            {
                field: 'equipmentId',
                minWidth: '80',
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationCurveDynamicModelHeader',
                }),
            },
            {
                field: 'variableId',
                minWidth: '80',
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationCurveVariableHeader',
                }),
            },
        ];
    }, [intl]);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true,
            lockPinned: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
        };
    }, []);

    const onGridReady = useCallback(
        (params) => {
            /*fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => setRowData(data));*/
            setRowData(curves);
        },
        [curves]
    );

    const onSelectionChanged = useCallback(() => {
        const selectedRows = gridRef.current.api.getSelectedRows();
        setSelectedRowsLength(selectedRows.length);
        console.log('Number of selected row', selectedRows.length);
    }, []);

    const handleAdd = useCallback(() => {
        console.log('handleAdd is called');
        setOpen((prevState) => !prevState);
    }, []);

    const handleDelete = useCallback(() => {
        console.log('handleDelete is called');
        const selectedRows = gridRef.current.api.getSelectedRows();
        setRowData((prev) => {
            const remainingRows = prev.filter(
                (elem) =>
                    !selectedRows.find(
                        (selectedElem) =>
                            elem.equipmentId === selectedElem.equipmentId &&
                            elem.variableId === selectedElem.variableId
                    )
            );

            // update parameter curves
            onUpdateCurve(remainingRows);

            // reset selected rows length
            setSelectedRowsLength(0);

            return remainingRows;
        });
    }, [onUpdateCurve]);

    return (
        curves && (
            <>
                <Grid container item sx={{ marginBottom: theme.spacing(1) }}>
                    <Grid container item xs={'auto'}>
                        <GlobalFilter
                            key={'curve-quick-filter'}
                            ref={quickFilterRef}
                            gridRef={gridRef}
                            disabled={false}
                        />
                    </Grid>
                    <Grid
                        container
                        item
                        xs={'auto'}
                        sx={{
                            justifyContent: 'flex-end',
                            alignItems: 'flex-end',
                            paddingLeft: theme.spacing(1),
                        }}
                    >
                        <Typography
                            //sx={{ marginBottom: theme.spacing(1) }}
                            variant="subtitle1"
                        >
                            {`(${selectedRowsLength} / ${rowData.length})`}
                        </Typography>
                    </Grid>
                    <GridButtons
                        onAddButton={handleAdd}
                        onDeleteButton={handleDelete}
                    />
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
                {open && (
                    <CurveSelectorDialog
                        open={open}
                        onClose={handleClose}
                        onSave={handleSave}
                    />
                )}
            </>
        )
    );
};

export default CurveParameters;
