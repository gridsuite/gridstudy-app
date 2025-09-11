/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Grid, Box, Typography, Theme } from '@mui/material';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { ValueFormatterParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { AGGRID_LOCALES } from '../../../../../../translations/not-intl/aggrid-locales';

const styles = {
    grid: {
        width: 'auto',
        height: '100%',
    },
    h6: (theme: Theme) => ({
        marginBottom: theme.spacing(2),
    }),
};

export interface Curve {
    equipmentType: EQUIPMENT_TYPES;
    equipmentId: string;
    variableId: string | undefined;
}

export interface CurveHandler {
    api: {
        addCurves: (curves: Curve[]) => void;
        removeCurves: () => void;
        getCurves: () => Curve[];
    };
}

function isCurveAlreadyAdded(curves: Curve[], curve: Curve): boolean {
    return curves.some((elem) => elem.equipmentId === curve.equipmentId && elem.variableId === curve.variableId);
}

function isRowSelected(elem: Curve, selectedRows: Curve[]): boolean {
    return selectedRows.some(
        (selectedElem) => elem.equipmentId === selectedElem.equipmentId && elem.variableId === selectedElem.variableId
    );
}

const CurvePreview = forwardRef<CurveHandler>((props, ref) => {
    const intl = useIntl();
    const gridRef = useRef<AgGridReact<any>>(null);

    const [rowData, setRowData] = useState<Curve[]>([]);
    const [selectedRowsLength, setSelectedRowsLength] = useState(0);
    const columnDefs = useMemo(() => {
        return [
            {
                field: 'equipmentId',
                minWidth: 80,
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationCurveDynamicModelHeader',
                }),
            },
            {
                field: 'variableId',
                minWidth: 80,
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationCurveVariableHeader',
                }),
                valueFormatter: (params: ValueFormatterParams) =>
                    intl.formatMessage({
                        id: `variables.${params.value}`,
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
        if (!gridRef.current) {
            return;
        }
        const selectedRows = gridRef.current.api.getSelectedRows();

        setSelectedRowsLength(selectedRows.length);
    }, []);

    const addCurves = useCallback((curves: Curve[]) => {
        setRowData((prev) => {
            const notYetAddedCurves = curves.filter((curve) => !isCurveAlreadyAdded(prev, curve));
            return [...prev, ...notYetAddedCurves];
        });
    }, []);

    const removeCurves = useCallback(() => {
        if (!gridRef.current) {
            return;
        }
        const selectedRows = gridRef.current.api.getSelectedRows();

        // reset selected rows length
        setSelectedRowsLength(0);

        setRowData((prev) => {
            const remainingRows = prev.filter((elem) => !isRowSelected(elem, selectedRows));
            return remainingRows;
        });
    }, []);

    // expose some api for the component by using ref
    useImperativeHandle(
        ref,
        () => ({
            api: {
                addCurves,
                removeCurves,
                getCurves: () => {
                    return rowData;
                },
            },
        }),
        [addCurves, removeCurves, rowData]
    );

    return (
        <>
            <Grid item>
                <Typography sx={styles.h6} variant="h6">
                    <FormattedMessage id={'DynamicSimulationCurveToAdd'} />
                    {` (${selectedRowsLength} / ${rowData.length})`}
                </Typography>
            </Grid>
            <Grid item xs>
                <Box sx={styles.grid}>
                    <CustomAGGrid
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        rowSelection={'multiple'}
                        onSelectionChanged={onSelectionChanged}
                        overrideLocales={AGGRID_LOCALES}
                    />
                </Box>
            </Grid>
        </>
    );
});

export default CurvePreview;
