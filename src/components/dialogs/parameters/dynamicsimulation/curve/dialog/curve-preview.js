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
    },
}));

const CurvePreview = forwardRef((props, ref) => {
    const intl = useIntl();
    const classes = useStyles();
    const theme = useTheme();
    const gridRef = useRef();

    const [rowData, setRowData] = useState([]);
    const [selectedRowsLength, setSelectedRowsLength] = useState(0);
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

    const onSelectionChanged = useCallback(() => {
        const selectedRows = gridRef.current.api.getSelectedRows();
        setSelectedRowsLength(selectedRows.length);
    }, []);

    // expose some api for the component by using ref
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

                    // reset selected rows length
                    setSelectedRowsLength(0);

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
                {` (${selectedRowsLength} / ${rowData.length})`}
            </Typography>
            <div className={clsx([theme.aggrid, classes.grid])}>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowSelection={'multiple'}
                    onSelectionChanged={onSelectionChanged}
                ></AgGridReact>
            </div>
        </>
    );
});

export default CurvePreview;
