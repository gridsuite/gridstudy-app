/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, MenuItem, Select, Typography, useTheme } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import CountrySelect from '../country-select';
import CheckboxSelect from '../common/checkbox-select';
import { useSelector } from 'react-redux';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from '../../../../../utils/equipment-types';
import { EQUIPMENT_FETCHERS } from 'components/utils/equipment-fetchers';
import { Box } from '@mui/system';
import { CustomAGGrid } from '../../../../../custom-aggrid/custom-aggrid';

export const CURVE_EQUIPMENTS = {
    [EQUIPMENT_TYPES.GENERATOR]: {
        type: EQUIPMENT_TYPES.GENERATOR,
        fetchers: EQUIPMENT_FETCHERS.GENERATOR,
    },
    [EQUIPMENT_TYPES.LOAD]: {
        type: EQUIPMENT_TYPES.LOAD,
        fetchers: EQUIPMENT_FETCHERS.LOAD,
    },
};

const TENSION_UNIT = 'kV';

const styles = {
    grid: {
        width: '100%',
        height: '100%',
    },
};

const EquipmentFilter = forwardRef(
    ({ equipment: initialEquipment, onChangeEquipment }, ref) => {
        const { snackError } = useSnackMessage();
        const [gridReady, setGridReady] = useState(false);
        const [substationsFiltersReady, setSubstationsFiltersReady] =
            useState(false);
        const [voltageLevelsFiltersReady, setVoltageLevelsFiltersReady] =
            useState(false);

        const studyUuid = useSelector((state) => state.studyUuid);
        const currentNode = useSelector((state) => state.currentTreeNode);

        const intl = useIntl();
        const theme = useTheme();
        const equipmentsRef = useRef();

        // --- Equipment types --- //
        const [equipment, setEquipment] = useState(initialEquipment);

        const handleEquipmentTypeChange = useCallback(
            (event) => {
                const selectedEquipment = event.target.value;
                setEquipment(selectedEquipment);
                onChangeEquipment(selectedEquipment);
            },
            [onChangeEquipment]
        );

        // --- Voltage levels (id metadata), tension (nominalV metadata) => lookup in Voltage levels --- //
        const [selectedVoltageLevelIds, setSelectedVoltageLevelIds] = useState(
            []
        );
        const [voltageLevels, setVoltageLevels] = useState({});
        const voltageLevelIds = useMemo(
            () => Object.keys(voltageLevels),
            [voltageLevels]
        );

        const handleVoltageLevelChange = useCallback(
            (selectedVoltageLevelIds) => {
                setSelectedVoltageLevelIds(selectedVoltageLevelIds);
            },
            []
        );

        const [selectedTensionIds, setSelectedTensionIds] = useState([]);
        const [tensions, setTensions] = useState({});
        const tensionIds = useMemo(() => Object.keys(tensions), [tensions]);

        const handleTensionChange = useCallback((selectedTensionIds) => {
            setSelectedTensionIds(selectedTensionIds);
        }, []);

        // load VoltageLevels from backend
        useEffect(() => {
            Promise.all(
                EQUIPMENT_FETCHERS.VOLTAGE_LEVEL.map((fetchPromise) =>
                    fetchPromise(studyUuid, currentNode.id)
                )
            )
                .then((vals) => {
                    // convert array to voltageLevels object
                    const voltageLevelsObj = vals
                        .flat()
                        .reduce(
                            (obj, curr) => ({ ...obj, [curr.id]: curr.name }),
                            {}
                        );

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

                    // update loading state
                    setSubstationsFiltersReady(true);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'DynamicSimulationFetchVoltageLevelError',
                    });
                });
        }, [currentNode.id, studyUuid, snackError]);

        // --- country (countryCode metadata) => lookup in substation --- //
        const [selectedCountries, setSelectedCountries] = useState([]);
        const [countries, setCountries] = useState([]);
        const handleCountryChange = useCallback((selectedCountries) => {
            setSelectedCountries(selectedCountries);
        }, []);

        // load substation from backend to infer countries
        useEffect(() => {
            Promise.all(
                EQUIPMENT_FETCHERS.SUBSTATION.map((fetchPromise) =>
                    fetchPromise(studyUuid, currentNode.id)
                )
            )
                .then((vals) => {
                    // get countries codes
                    let countries = [
                        ...vals.flat().reduce((set, substation) => {
                            substation.countryCode &&
                                set.add(substation.countryCode);
                            return set;
                        }, new Set()),
                    ];

                    // update countries states
                    setSelectedCountries(countries);
                    setCountries(countries);

                    // update loading state
                    setVoltageLevelsFiltersReady(true);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'DynamicSimulationFetchSubstationError',
                    });
                });
        }, [currentNode.id, studyUuid, snackError]);

        // fetching and filtering equipments by filters
        const loadFilteredEquipments = useCallback(() => {
            // get all substations which include also voltage levels
            return Promise.all(
                EQUIPMENT_FETCHERS.SUBSTATION.map((fetchPromise) =>
                    fetchPromise(studyUuid, currentNode.id)
                )
            )
                .then((vals) => {
                    const substations = vals.flat();
                    const voltageLevels = substations.reduce(
                        (arr, substation) =>
                            substation.voltageLevels
                                ? [...arr, ...substation.voltageLevels]
                                : arr,
                        []
                    );

                    // filtering substations by country and region
                    const filteredSubstationIds = substations
                        .filter((substation) => {
                            let matched = true; // by default whatever substation is taken into account
                            if (selectedCountries.length) {
                                matched &= selectedCountries.includes(
                                    substation.countryCode
                                );
                            }
                            return matched;
                        })
                        .map((substation) => substation.id);

                    // get equipments by type and substation ids
                    return Promise.all(
                        equipment.fetchers.map((fetchPromise) =>
                            fetchPromise(
                                studyUuid,
                                currentNode.id,
                                filteredSubstationIds
                            )
                        )
                    )
                        .then((vals) => {
                            const equipments = vals.flat();

                            // filter equipment by voltageLevel ids and tension
                            const filteredEquipments = equipments.filter(
                                (equipment) => {
                                    let matched = true; // by default whatever equipment is taken into account

                                    if (selectedVoltageLevelIds.length) {
                                        matched &=
                                            selectedVoltageLevelIds.includes(
                                                equipment.voltageLevelId
                                            );
                                    }

                                    if (selectedTensionIds.length) {
                                        matched &= selectedTensionIds.includes(
                                            `${
                                                voltageLevels.find(
                                                    (elem) =>
                                                        elem.id ===
                                                        equipment.voltageLevelId
                                                )?.nominalVoltage
                                            }`
                                        );
                                    }
                                    return matched;
                                }
                            );
                            return filteredEquipments;
                        })
                        .catch((error) => {
                            snackError({
                                messageTxt: error.message,
                                headerId:
                                    'DynamicSimulationFetchEquipmentError',
                            });
                        });
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'DynamicSimulationFetchSubstationError',
                    });
                });
        }, [
            studyUuid,
            currentNode.id,
            selectedCountries,
            selectedTensionIds,
            selectedVoltageLevelIds,
            equipment.fetchers,
            snackError,
        ]);

        useEffect(() => {
            if (
                gridReady &&
                voltageLevelsFiltersReady &&
                substationsFiltersReady
            ) {
                loadFilteredEquipments().then((equipments) => {
                    setEquipmentRowData(equipments);
                });
            }
        }, [
            loadFilteredEquipments,
            gridReady,
            voltageLevelsFiltersReady,
            substationsFiltersReady,
        ]);

        // grid configuration
        const [equipmentRowData, setEquipmentRowData] = useState([]);
        const [selectedRowsLength, setSelectedRowsLength] = useState(0);
        const columnDefs = useMemo(() => {
            return [
                {
                    field: 'id',
                    checkboxSelection: true,
                    headerCheckboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true,
                    minWidth: 80,
                    headerName: intl.formatMessage({
                        id: 'DynamicSimulationCurveDynamicModelHeader',
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

        const onGridReady = useCallback((params) => {
            setGridReady(true);
        }, []);

        const handleEquipmentSelectionChanged = useCallback(() => {
            const selectedRows = equipmentsRef.current.api.getSelectedRows();
            setSelectedRowsLength(selectedRows.length);
        }, []);

        // expose some api for the component by using ref
        useImperativeHandle(
            ref,
            () => ({
                api: {
                    getSelectedEquipments: () => {
                        return equipmentsRef.current.api.getSelectedRows();
                    },
                },
            }),
            []
        );

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
                            value={equipment}
                            onChange={handleEquipmentTypeChange}
                            size="small"
                            sx={{ width: '100%' }}
                        >
                            {Object.entries(CURVE_EQUIPMENTS).map(
                                ([key, value]) => (
                                    <MenuItem key={key} value={value}>
                                        {intl.formatMessage({ id: value.type })}
                                    </MenuItem>
                                )
                            )}
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
                            getOptionLabel={(value) =>
                                voltageLevels[value] ?? value
                            }
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
                <Grid
                    item
                    container
                    xs
                    sx={{ width: '100%' }}
                    direction={'column'}
                >
                    <Grid>
                        <Typography
                            sx={{ marginBottom: theme.spacing(1) }}
                            variant="subtitle1"
                        >
                            <FormattedMessage
                                id={'DynamicSimulationCurveEquipment'}
                            ></FormattedMessage>
                            {` (${selectedRowsLength} / ${equipmentRowData.length})`}
                        </Typography>
                    </Grid>
                    <Grid xs>
                        <Box sx={styles.grid}>
                            <CustomAGGrid
                                ref={equipmentsRef}
                                rowData={equipmentRowData}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowSelection={'multiple'}
                                onGridReady={onGridReady}
                                onSelectionChanged={
                                    handleEquipmentSelectionChanged
                                }
                            ></CustomAGGrid>
                        </Box>
                    </Grid>
                </Grid>
            </>
        );
    }
);

export default EquipmentFilter;
