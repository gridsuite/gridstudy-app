/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, MenuItem, Select, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import clsx from 'clsx';
import { AgGridReact } from 'ag-grid-react';
import { makeStyles, useTheme } from '@mui/styles';
import CountrySelect from '../country-select';
import CheckboxSelect from '../common/checkbox-select';
import { useSelector } from 'react-redux';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES as ALL_EQUIPMENT_TYPES } from '../../../../../util/equipment-types';

export const EQUIPMENT_TYPES = {
    [ALL_EQUIPMENT_TYPES.GENERATOR.type]: ALL_EQUIPMENT_TYPES.GENERATOR,
    [ALL_EQUIPMENT_TYPES.LOAD.type]: ALL_EQUIPMENT_TYPES.LOAD,
    [ALL_EQUIPMENT_TYPES.LINE.type]: ALL_EQUIPMENT_TYPES.LINE,
};

const REGIONS = {
    ['GERMANY']: 'Germany',
    ['ENGLAND']: 'England',
    ['PARIS']: 'Paris',
    ['NANTES']: 'Nantes',
    ['LYON']: 'Lyon',
    ['SUISSE']: 'Suisse',
};

const TENSION_UNIT = 'kV';

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

const EquipmentFilter = ({
    equipmentType: initialEquipmentType,
    onChangeEquipmentType,
}) => {
    const { snackError } = useSnackMessage();

    const studyUuid = useSelector((state) => state.studyUuid);
    const treeModel = useSelector(
        (state) => state.networkModificationTreeModel
    );

    // TODO provide a getter getRootNode() in NetworkModificationTreeModel
    const rootNodeUuid = treeModel.treeNodes[0].id;

    const intl = useIntl();
    const classes = useStyles();
    const theme = useTheme();
    const gridRef = useRef();

    // --- Equipment types --- //
    const [equipmentType, setEquipmentType] = useState(initialEquipmentType);

    const handleEquipmentTypeChange = useCallback(
        (event) => {
            const selectedEquipmentType = event.target.value;
            setEquipmentType(selectedEquipmentType);
            onChangeEquipmentType(selectedEquipmentType);
        },
        [onChangeEquipmentType]
    );

    // --- Voltage levels, tension (nominalV) --- //
    const [selectedVoltageLevelIds, setSelectedVoltageLevelIds] = useState([]);
    const [voltageLevels, setVoltageLevels] = useState({});
    const voltageLevelIds = useMemo(
        () => Object.keys(voltageLevels),
        [voltageLevels]
    );

    const handleVoltageLevelChange = useCallback((selectedVoltageLevelIds) => {
        setSelectedVoltageLevelIds(selectedVoltageLevelIds);
    }, []);

    const [selectedTensionIds, setSelectedTensionIds] = useState([]);
    const [tensions, setTensions] = useState({});
    const tensionIds = useMemo(() => Object.keys(tensions), [tensions]);

    const handleTensionChange = useCallback((selectedVoltageLevelIds) => {
        setSelectedVoltageLevelIds(selectedVoltageLevelIds);
    }, []);

    // load VoltageLevels from backend
    useEffect(() => {
        Promise.all(
            ALL_EQUIPMENT_TYPES.VOLTAGE_LEVEL.fetchers.map((fetchPromise) =>
                fetchPromise(studyUuid, rootNodeUuid)
            )
        ).then((vals) => {
            console.log('vals', vals);
            // convert array to voltageLevels object
            const voltageLevelsObj = vals
                .flat()
                .reduce((obj, curr) => ({ ...obj, [curr.id]: curr.name }), {});

            // convert array to tensions object
            const tensionObj = vals.flat().reduce(
                (obj, curr) => ({
                    ...obj,
                    [`${curr.nominalVoltage}`]: curr.nominalVoltage,
                }),
                {}
            );

            // update voltage level states
            setVoltageLevels(voltageLevelsObj);
            setSelectedVoltageLevelIds(Object.keys(voltageLevelsObj));

            // update tension states
            setTensions(tensionObj);
            setSelectedTensionIds(Object.keys(tensionObj));
        });
    }, [rootNodeUuid, studyUuid]);

    // --- country, region => lookup in substation --- //
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [countries, setCountries] = useState([]);
    const handleCountryChange = useCallback((selectedCountries) => {
        setSelectedCountries(selectedCountries);
    }, []);

    const [selectedRegions, setSelectedRegions] = useState([]);
    const [regions, setRegions] = useState([]);
    const handleRegionChange = useCallback((selectedRegions) => {
        setSelectedRegions(selectedRegions);
    }, []);

    // load substation from backend to infer countries and (regions from geographicalTags ?? TO CONFIRM)
    useEffect(() => {
        Promise.all(
            ALL_EQUIPMENT_TYPES.SUBSTATION.fetchers.map((fetchPromise) =>
                fetchPromise(studyUuid, rootNodeUuid)
            )
        ).then((vals) => {
            // get countries codes
            let countries = [
                ...vals.flat().reduce((set, substation) => {
                    substation.countryCode && set.add(substation.countryCode);
                    return set;
                }, new Set()),
            ];

            // get regions codes
            let regions = [
                ...vals.flat().reduce((set, substation) => {
                    substation.geographicalTags &&
                        set.add(substation.geographicalTags);
                    return set;
                }, new Set()),
            ];

            // TODO : mock regions in case any regions found
            if (!regions.length) {
                regions = Object.keys(REGIONS);
            }

            // update countries states
            setSelectedCountries(countries);
            setCountries(countries);

            // update regions states
            setSelectedRegions(regions);
            setRegions(regions);
        });
    }, [rootNodeUuid, studyUuid]);

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
        Promise.all(
            Object.values(EQUIPMENT_TYPES)
                .map((equipmentType) => equipmentType.fetchers)
                .flat()
                .map((fetchPromise) => fetchPromise(studyUuid, rootNodeUuid))
        ).then((vals) => {
            console.log('fetch all equipments', vals);
        });
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
                        {Object.entries(EQUIPMENT_TYPES).map(([key, value]) => (
                            <MenuItem key={key} value={value}>
                                {value.type}
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
                    <CheckboxSelect
                        value={selectedVoltageLevelIds}
                        options={voltageLevelIds}
                        getOptionLabel={(value) => voltageLevels[value]}
                        onChange={handleVoltageLevelChange}
                    />
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
                    <CountrySelect
                        value={selectedCountries}
                        options={countries}
                        onChange={handleCountryChange}
                    />
                </Grid>
            </Grid>
            {/* Region */}
            <Grid item container sx={{ width: '100%' }}>
                <Grid item xs={6}>
                    <Typography>
                        <FormattedMessage
                            id={'DynamicSimulationCurveRegion'}
                        ></FormattedMessage>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <CheckboxSelect
                        value={selectedRegions}
                        options={regions}
                        getOptionLabel={(value) => REGIONS[value]}
                        onChange={handleRegionChange}
                    />
                </Grid>
            </Grid>
            {/* Tension */}
            <Grid item container sx={{ width: '100%' }}>
                <Grid item xs={6}>
                    <Typography>
                        <FormattedMessage
                            id={'DynamicSimulationCurveTension'}
                        ></FormattedMessage>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <CheckboxSelect
                        options={tensionIds}
                        getOptionLabel={(value) =>
                            `${tensions[value]} ${TENSION_UNIT}`
                        }
                        value={selectedTensionIds}
                        onChange={handleTensionChange}
                    />
                </Grid>
            </Grid>
            {/* Equipments */}
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
