/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, MenuItem, Select, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { AgGridReact } from 'ag-grid-react';
import { makeStyles, useTheme } from '@mui/styles';
import CountryAutocomplete from '../country-autocomplete';

const EQUIPMENT_TYPE = {
    GENERATOR: 'Generator',
    LOAD: 'Load',
    BUS: 'Line',
};

const POST = {
    POST: 'Postes',
    OTHER: 'Other',
};

const COUNTRY = {
    FRANCE: 'France',
    PAKISTAN: 'Pakistan',
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

const equipments = [
    {
        dynamicModelId: '_GEN____1_SM',
        dynamicModelName: 'GEN    1_SM',
    },
    {
        dynamicModelId: '_GEN____2_SM',
        dynamicModelName: 'GEN    2_SM',
    },
    {
        dynamicModelId: '_GEN____3_SM',
        dynamicModelName: 'GEN    3_SM',
    },
    {
        dynamicModelId: '_GEN____6_SM',
        dynamicModelName: 'GEN    6_SM',
    },
    {
        dynamicModelId: '_LOAD___2_EC',
        dynamicModelName: 'LOAD   2_EC',
    },
    {
        dynamicModelId: '_BUS____7_TN',
        dynamicModelName: 'BUS    7_TN',
    },
];

const EquipmentFilter = (props) => {
    const intl = useIntl();
    const classes = useStyles();
    const theme = useTheme();
    const gridRef = useRef();

    const [equipmentType, setEquipmentType] = useState(
        EQUIPMENT_TYPE.GENERATOR
    );
    const handleEquipmentTypeChange = useCallback((event) => {
        setEquipmentType(event.target.value);
    }, []);

    const [post, setPost] = useState(POST.POST);
    const handlePostChange = useCallback((event) => {
        setPost(event.target.value);
    }, []);

    const [country, setCountry] = useState(COUNTRY.FRANCE);
    const handleCountryChange = useCallback((event) => {
        setCountry(event.target.value);
    }, []);

    // grid configuration
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'dynamicModelName',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
            minWidth: '80',
            headerName: intl.formatMessage({
                id: 'DynamicSimulationCurveDynamicModelHeader',
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
        setRowData(equipments);
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
                            id={'DynamicSimulationCurveEquipmentType'}
                        ></FormattedMessage>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Select
                        labelId={'DynamicSimulationCurveEquipementType'}
                        value={equipmentType}
                        onChange={handleEquipmentTypeChange}
                        size="small"
                        sx={{ width: '100%' }}
                    >
                        {Object.entries(EQUIPMENT_TYPE).map(([key, value]) => (
                            <MenuItem key={key} value={value}>
                                {value}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Grid>
            {/* Post */}
            <Grid item container sx={{ width: '100%' }}>
                <Grid item xs={6}>
                    <Typography>
                        <FormattedMessage
                            id={'DynamicSimulationCurvePost'}
                        ></FormattedMessage>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Select
                        labelId={'DynamicSimulationCurvePost'}
                        value={post}
                        onChange={handlePostChange}
                        size="small"
                        sx={{ width: '100%' }}
                    >
                        {Object.entries(POST).map(([key, value]) => (
                            <MenuItem key={key} value={value}>
                                {value}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Grid>
            {/* Country */}
            <Grid item container sx={{ width: '100%' }}>
                <Grid item xs={6}>
                    <Typography>
                        <FormattedMessage
                            id={'DynamicSimulationCurveCountry'}
                        ></FormattedMessage>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    {/*<Select
                        labelId={'DynamicSimulationCurveCountry'}
                        value={country}
                        onChange={handleCountryChange}
                        size="small"
                        sx={{ width: '100%' }}
                    >
                        {Object.entries(COUNTRY).map(([key, value]) => (
                            <MenuItem key={key} value={value}>
                                {value}
                            </MenuItem>
                        ))}
                    </Select>*/}
                    <CountryAutocomplete />
                </Grid>
            </Grid>
            <Grid item xs sx={{ width: '100%' }}>
                <Typography
                    sx={{ marginBottom: theme.spacing(1) }}
                    variant="subtitle1"
                >
                    <FormattedMessage
                        id={'DynamicSimulationCurveEquipment'}
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

export default EquipmentFilter;
