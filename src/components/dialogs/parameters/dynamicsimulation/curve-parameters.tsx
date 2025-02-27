/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';
import GridButtons from './curve/grid-buttons';
import { useIntl } from 'react-intl';
import CurveSelectorDialog from './curve/dialog/curve-selector-dialog';
import { GlobalFilter } from '../../../spreadsheet/global-filter';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { AgGridReact } from 'ag-grid-react';
import { Curve as CurveType } from './curve/dialog/curve-preview';
import { ValueFormatterParams } from 'ag-grid-community';
import { Curve } from './dynamic-simulation-utils';

const styles = {
    grid: {
        width: 'auto',
        height: '100%',
    },
};

const CurveParameters = ({ path }: { path: string }) => {
    const intl = useIntl();
    const [selectedRowsLength, setSelectedRowsLength] = useState(0);

    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${path}.${Curve.CURVES}`,
    });

    const rowData = fields as unknown as CurveType[]; //TODO fix in a better way if possible

    // handle open/close/append curve selector dialog
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => {
        setOpen((prevState) => !prevState);
    }, []);
    const handleAppend = useCallback(
        (newCurves: CurveType[]) => {
            // do save here
            const notYetAddedCurves = newCurves.filter(
                // use functional keys to lookup
                (curve) =>
                    !rowData.find(
                        (elem) =>
                            elem[Curve.EQUIPMENT_ID] === curve[Curve.EQUIPMENT_ID] &&
                            elem[Curve.VARIABLE_ID] === curve[Curve.VARIABLE_ID]
                    )
            );

            // add new curves via provided method by hook
            append(notYetAddedCurves);

            setOpen((prevState) => !prevState);
        },
        [append, rowData]
    );

    const handleAdd = useCallback(() => {
        setOpen((prevState) => !prevState);
    }, []);

    const handleDelete = useCallback(() => {
        const selectedRows = gridRef.current?.api.getSelectedRows();

        const indexesToRemove = selectedRows?.map((elem) =>
            // use functional keys to lookup
            rowData.findIndex(
                (row) =>
                    elem[Curve.EQUIPMENT_ID] === row[Curve.EQUIPMENT_ID] &&
                    elem[Curve.VARIABLE_ID] === row[Curve.VARIABLE_ID]
            )
        );

        // remove curves via provided method by hook
        remove(indexesToRemove);
        // reset selected rows length
        setSelectedRowsLength(0);
    }, [remove, rowData]);

    const quickFilterRef = useRef();

    // curve grid configuration
    const theme = useTheme();
    const gridRef = useRef<AgGridReact>(null);

    const columnDefs = useMemo(() => {
        return [
            {
                field: Curve.EQUIPMENT_ID,
                checkboxSelection: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                minWidth: 80,
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationCurveDynamicModelHeader',
                }),
            },
            {
                field: Curve.VARIABLE_ID,
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
        const selectedRows = gridRef.current?.api.getSelectedRows();
        setSelectedRowsLength(selectedRows?.length ?? 0);
    }, []);

    return (
        <>
            <Grid container direction={'column'} sx={{ height: 640 }}>
                {/* header toolbar of the aggrid */}
                <Grid container item sx={{ marginBottom: theme.spacing(1) }}>
                    <Grid container item xs={'auto'}>
                        <GlobalFilter key={'curve-quick-filter'} ref={quickFilterRef} gridRef={gridRef} />
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
                        <Typography variant="subtitle1">
                            {`${intl.formatMessage({
                                id: 'DynamicSimulationCurveSelectedNumber',
                            })} (${selectedRowsLength} / ${rowData.length})`}
                        </Typography>
                    </Grid>
                    <GridButtons onAddButton={handleAdd} onDeleteButton={handleDelete} />
                </Grid>
                {/* aggrid for configured curves */}
                <Grid item xs>
                    <Box sx={styles.grid}>
                        <CustomAGGrid
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowSelection={'multiple'}
                            onSelectionChanged={onSelectionChanged}
                        />
                    </Box>
                </Grid>
            </Grid>
            {open && <CurveSelectorDialog open={open} onClose={handleClose} onSave={handleAppend} />}
        </>
    );
};

export default CurveParameters;
