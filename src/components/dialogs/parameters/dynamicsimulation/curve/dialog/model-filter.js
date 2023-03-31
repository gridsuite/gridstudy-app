/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import { makeStyles, useTheme } from '@mui/styles';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import clsx from 'clsx';
import { AgGridReact } from 'ag-grid-react';
import CheckmarkSelect from '../checkmark-select';
import { EQUIPMENT_TYPE } from './equipment-filter';
import CheckmarkTreeView, { data, data2 } from '../checkmark-treeview';

// take from table models in DB dynamicmappings
const MODELS = {
    // EQUIPMENT_TYPE.LOAD
    [EQUIPMENT_TYPE.LOAD]: {
        LoadAlphaBeta: 'Load Alpha Beta',
        LoadPQ: 'Load PQ',
    },
    // EQUIPMENT_TYPE.GENERATOR
    [EQUIPMENT_TYPE.GENERATOR]: {
        GeneratorSynchronousThreeWindings:
            'Generator Synchronous Three Windings',
        GeneratorSynchronousFourWindings: 'Generator Synchronous Four Windings',
        GeneratorSynchronousThreeWindingsProportionalRegulations:
            'Generator Synchronous Three Windings Proportional Regulations',
        GeneratorSynchronousFourWindingsProportionalRegulations:
            'Generator Synchronous Four Windings Proportional Regulations',
        GeneratorPQ: 'Generator PQ',
        GeneratorPV: 'Generator PV',
    },
};

const VARIABLES = {
    // EQUIPMENT_TYPE.LOAD
    // LoadAlphaBeta
    [MODELS[EQUIPMENT_TYPE.LOAD].LoadAlphaBeta]: {
        load_alpha: 'Load Alpha',
        load_beta: 'Load Beta',
        load_P0Pu: 'Load P0Pu',
        load_Q0Pu: 'Load Q0Pu',
        load_U0Pu: 'Load U0Pu',
        load_UPhase0: 'Load UPhase0',
    },
    // LoadPQ
    [MODELS[EQUIPMENT_TYPE.LOAD].LoadPQ]: {
        load_P0Pu: 'Load P0Pu',
        load_Q0Pu: 'Load Q0Pu',
        load_U0Pu: 'Load U0Pu',
        load_UPhase0: 'Load UPhase0',
    },
    // EQUIPMENT_TYPE.GENERATOR
    // GeneratorSynchronousThreeWindings
    [MODELS[EQUIPMENT_TYPE.GENERATOR].GeneratorSynchronousThreeWindings]: {
        generator_UNom: 'Generator UNom',
        generator_SNom: 'Generator SNom',
        generator_PNomTurb: 'Generator PNom Turb',
        generator_PNomAlt: 'Generator PNom Alt',
    },
    // GeneratorSynchronousFourWindings
    [MODELS[EQUIPMENT_TYPE.GENERATOR].GeneratorSynchronousFourWindings]: {
        generator_UNom: 'Generator UNom',
        generator_SNom: 'Generator SNom',
        generator_PNomTurb: 'Generator PNom Turb',
        generator_PNomAlt: 'Generator PNom Alt',
    },
};

const VARIABLES_ARR = [
    // EQUIPMENT_TYPE.LOAD
    // LoadAlphaBeta
    {
        model: MODELS[EQUIPMENT_TYPE.LOAD].LoadAlphaBeta,
        name: 'Load Alpha',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.LOAD].LoadAlphaBeta,
        name: 'Load Beta',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.LOAD].LoadAlphaBeta,
        name: 'Load P0Pu',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.LOAD].LoadAlphaBeta,
        name: 'Load Q0Pu',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.LOAD].LoadAlphaBeta,
        name: 'Load U0Pu',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.LOAD].LoadAlphaBeta,
        name: 'Load UPhase0',
    },
    // LoadPQ
    {
        model: MODELS[EQUIPMENT_TYPE.LOAD].LoadPQ,
        name: 'Load P0Pu',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.LOAD].LoadPQ,
        name: 'Load Q0Pu',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.LOAD].LoadPQ,
        name: 'Load U0Pu',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.LOAD].LoadPQ,
        name: 'Load UPhase0',
    },
    // EQUIPMENT_TYPE.GENERATOR
    // GeneratorSynchronousThreeWindings
    {
        model: MODELS[EQUIPMENT_TYPE.GENERATOR]
            .GeneratorSynchronousThreeWindings,
        name: 'Generator UNom',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.GENERATOR]
            .GeneratorSynchronousThreeWindings,
        name: 'Generator SNom',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.GENERATOR]
            .GeneratorSynchronousThreeWindings,
        name: 'Generator PNom Turb',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.GENERATOR]
            .GeneratorSynchronousThreeWindings,
        name: 'Generator PNom Alt',
    },
    // GeneratorSynchronousFourWindings
    {
        model: MODELS[EQUIPMENT_TYPE.GENERATOR]
            .GeneratorSynchronousFourWindings,
        name: 'Generator UNom',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.GENERATOR]
            .GeneratorSynchronousFourWindings,
        name: 'Generator SNom',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.GENERATOR]
            .GeneratorSynchronousFourWindings,
        name: 'Generator PNom Turb',
    },
    {
        model: MODELS[EQUIPMENT_TYPE.GENERATOR]
            .GeneratorSynchronousFourWindings,
        name: 'Generator PNom Alt',
    },
];

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

const ModelFilter = ({ equipmentType = EQUIPMENT_TYPE.LOAD }) => {
    const intl = useIntl();
    const classes = useStyles();
    const theme = useTheme();
    const gridRef = useRef();

    const [model, setModel] = useState([]);
    const handleModelChange = useCallback((event) => {
        setModel(event.target.value);
    }, []);

    // grid configuration
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([
        { field: 'country', rowGroup: true, hide: true },
        { field: 'sport', rowGroup: true, hide: true },
        { field: 'gold', aggFunc: 'sum' },
        /*{
            field: 'model',
            rowGroup: true,
            hide: true,
        },*/
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

    const autoGroupColumnDef = useMemo(() => {
        return {
            headerName: 'Athlete',
            field: 'athlete',
            minWidth: 250,
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                checkbox: true,
            },
        };

        /*{
            headerName: intl.formatMessage({
                id: 'DynamicSimulationCurveVariableHeader',
            }),
            field: 'name',
            minWidth: 250,
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                checkbox: true,
                //suppressCount: true,
            },
        };*/
    }, []);

    const getDataPath = useMemo(() => {
        return (data) => {
            // transform into ag-grid format, i.e. ['path1', 'path2', 'path3']
            console.log('data', data);
            return [`${data.model}`, `${data.name}`];
        };
    }, []);

    const onGridReady = useCallback((params) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => setRowData(data));
        //setRowData(variables);
        //setRowData(VARIABLES_ARR);
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
                    <CheckmarkSelect
                        options={Object.keys(MODELS[equipmentType])}
                        getOptionLabel={(value) => MODELS[equipmentType][value]}
                        value={[...Object.keys(MODELS[equipmentType])]}
                    />
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
                    {/*<AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        autoGroupColumnDef={autoGroupColumnDef}
                        rowSelection={'multiple'}
                        groupSelectsChildren={true}
                        onGridReady={onGridReady}
                        onSelectionChanged={onSelectionChanged}
                        suppressRowClickSelection={true}
                    ></AgGridReact>*/}
                    <CheckmarkTreeView
                        data={data2}
                        sx={{
                            height: 300,
                            flexGrow: 1,
                            maxWidth: 400,
                            overflowY: 'auto',
                        }}
                    />
                </div>
            </Grid>
        </>
    );
};

export default ModelFilter;
