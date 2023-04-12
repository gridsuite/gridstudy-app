/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import clsx from 'clsx';
import { AgGridReact } from 'ag-grid-react';
import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { FormattedMessage, useIntl } from 'react-intl';
import { Typography } from '@mui/material';

const useStyles = makeStyles((theme) => ({
    grid: {
        width: 'auto',
        height: '100%',

        //overrides the default computed max height for ag grid default selector editor to make it more usable
        //can be removed if a custom selector editor is implemented
        // '& .ag-select-list': {
        //     maxHeight: '300px !important',
        // },
    },
}));

const CurvePreview = forwardRef((props, ref) => {
    const intl = useIntl();
    const classes = useStyles();
    const theme = useTheme();
    const gridRef = useRef();

    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'equipmentName',
            minWidth: '80',
            headerName: intl.formatMessage({
                id: 'DynamicSimulationCurveDynamicModelHeader',
            }),
        },
        {
            field: 'variableName',
            minWidth: '80',
            headerName: intl.formatMessage({
                id: 'DynamicSimulationCurveVariableHeader',
            }),
        },
    ]);
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

    const onGridReady = useCallback((params) => {
        /*fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => setRowData(data));*/
        // setRowData(curves);
    }, []);

    const onSelectionChanged = useCallback(() => {
        const selectedRows = gridRef.current.api.getSelectedRows();
        console.log('Number of selected row', selectedRows.length);
    }, []);

    // expose some interfaces for the component by using ref
    useImperativeHandle(
        ref,
        () => ({
            api: {
                addCurves: (curves) => {
                    setRowData((prev) => {
                        const notYetAddedCurves = curves.filter(
                            (curve) =>
                                !prev.find(
                                    (elem) =>
                                        elem.equipmentId ===
                                            curve.equipmentId &&
                                        elem.variableId === curve.variableId
                                )
                        );
                        return [...prev, ...notYetAddedCurves];
                    });
                },
                removeCurves: () => {
                    const selectedRows = gridRef.current.api.getSelectedRows();
                    setRowData((prev) => {
                        const remainingRows = prev.filter(
                            (elem) =>
                                !selectedRows.find(
                                    (selectedElem) =>
                                        elem.equipmentId ===
                                            selectedElem.equipmentId &&
                                        elem.variableId ===
                                            selectedElem.variableId
                                )
                        );
                        return remainingRows;
                    });
                },
                getCurves: () => {
                    return rowData;
                },
            },
        }),
        [rowData]
    );

    return (
        <>
            <Typography sx={{ marginBottom: theme.spacing(2) }} variant="h6">
                <FormattedMessage
                    id={'DynamicSimulationCurveToAdd'}
                ></FormattedMessage>
            </Typography>
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
    );
});

export default CurvePreview;
