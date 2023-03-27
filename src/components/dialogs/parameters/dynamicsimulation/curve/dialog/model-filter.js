/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import { makeStyles, useTheme } from '@mui/styles';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Grid, MenuItem, Select, Typography } from '@mui/material';
import clsx from 'clsx';
import { AgGridReact } from 'ag-grid-react';

const MODEL = {
    LoadAlphaBeta: 'Load Alpha Beta',
    GeneratorSynchronousThreeWindingsProportionalRegulations:
        'Generator Synchronous Three Windings Proportional Regulations',
    GeneratorSynchronousFourWindingsProportionalRegulations:
        'Generator Synchronous Four Windings Proportional Regulations',
};

const useStyles = makeStyles((theme) => ({
    grid: {
        width: '100%',
        height: '100%',

        //overrides the default computed max height for ag grid default selector editor to make it more usable
        //can be removed if a custom selector editor is implemented
        // '& .ag-select-list': {
        //     maxHeight: '300px !important',
        // },
    },
}));

const variables = [
    {
        variable: 'generator_omegaPu',
        variableName: 'Omega Pu',
    },
    {
        variable: 'generator_PGen',
        variableName: 'PGen',
    },

    {
        variable: 'generator_QGen',
        variableName: 'QGen',
    },
    {
        variable: 'generator_UStatorPu',
        variableName: 'UStatorPu',
    },

    {
        variable: 'voltageRegulator_EfdPu',
        variableName: 'Voltage Regulator EfdPu',
    },

    {
        variable: 'load_PPu',
        variableName: 'PPu',
    },
    {
        variable: 'load_QPu',
        variableName: 'QPu',
    },
    {
        variable: 'Upu_value',
        variableName: 'Upu',
    },
];

const ModelFilter = (props) => {
    const intl = useIntl();
    const classes = useStyles();
    const theme = useTheme();
    const gridRef = useRef();

    const [model, setModel] = useState(MODEL.LoadAlphaBeta);
    const handleModelChange = useCallback((event) => {
        setModel(event.target.value);
    }, []);

    // grid configuration
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([
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
        setRowData(variables);
    }, []);

    const onSelectionChanged = useCallback(() => {
        const selectedRows = gridRef.current.api.getSelectedRows();
        console.log('Number of selected row', selectedRows.length);
    }, []);

    return (
        <>
            {/* Equipment type */}
            <Grid item container sx={{ width: '100%' }}>
                <Grid item xs={6}>
                    <Typography>
                        <FormattedMessage
                            id={'DynamicSimulationCurveModel'}
                        ></FormattedMessage>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Select
                        labelId={'DynamicSimulationCurveModel'}
                        value={model}
                        onChange={handleModelChange}
                        size="small"
                        sx={{ width: '100%' }}
                    >
                        {Object.entries(MODEL).map(([key, value]) => (
                            <MenuItem key={key} value={value}>
                                {value}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Grid>
            <Grid item xs sx={{ width: '100%' }}>
                <Typography
                    sx={{ marginBottom: theme.spacing(1) }}
                    variant="subtitle1"
                >
                    <FormattedMessage
                        id={'DynamicSimulationCurveVariable'}
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
            </Grid>
        </>
    );
};

export default ModelFilter;
