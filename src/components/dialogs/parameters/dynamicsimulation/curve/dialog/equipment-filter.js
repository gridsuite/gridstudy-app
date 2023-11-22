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
import VirtualizedCheckboxAutocomplete from '../common/virtualized-checkbox-autocomplete';
import { fetchAllCountries } from '../../../../../../services/study/network-map';
import { evaluateFilter } from '../../../../../../services/study/filter';
import {
    CombinatorType,
    DataType,
} from '../../../../filter/expert/expert-filter.type';

export const CURVE_EQUIPMENT_TYPES = {
    [EQUIPMENT_TYPES.GENERATOR]: {
        type: EQUIPMENT_TYPES.GENERATOR,
        fetchers: EQUIPMENT_FETCHERS.GENERATOR,
    },
    [EQUIPMENT_TYPES.LOAD]: {
        type: EQUIPMENT_TYPES.LOAD,
        fetchers: EQUIPMENT_FETCHERS.LOAD,
    },
};

const NOMINAL_VOLTAGE_UNIT = 'kV';

const styles = {
    grid: {
        width: '100%',
        height: '100%',
    },
};

const EquipmentFilter = forwardRef(
    ({ equipmentType: initialEquipmentType, onChangeEquipmentType }, ref) => {
        const { snackError } = useSnackMessage();
        const [gridReady, setGridReady] = useState(false);
        const [countriesFilterReady, setCountriesFilterReady] = useState(false);

        const studyUuid = useSelector((state) => state.studyUuid);
        const currentNode = useSelector((state) => state.currentTreeNode);
        const mapEquipments = useSelector((state) => state.mapEquipments);

        const intl = useIntl();
        const theme = useTheme();
        const equipmentsRef = useRef();

        // --- Equipment types --- //
        const [equipmentType, setEquipmentType] =
            useState(initialEquipmentType);

        const handleEquipmentTypeChange = useCallback(
            (event) => {
                const selectedEquipmentType = event.target.value;
                setEquipmentType(selectedEquipmentType);
                onChangeEquipmentType(selectedEquipmentType);
            },
            [onChangeEquipmentType]
        );

        // --- Voltage levels, nominal voltages => lookup in mapEquipments which is loaded at booting up application --- //
        const voltageLevels = mapEquipments.getVoltageLevels();
        const voltageLevelIds = useMemo(
            () => voltageLevels.map((elem) => elem.id),
            [voltageLevels]
        );
        const [selectedVoltageLevelIds, setSelectedVoltageLevelIds] = useState(
            []
        );
        const handleVoltageLevelChange = useCallback(
            (selectedVoltageLevelIds) => {
                setSelectedVoltageLevelIds(selectedVoltageLevelIds);
            },
            []
        );

        const nominalVoltages = mapEquipments.getNominalVoltages();
        const [selectedNominalVoltages, setSelectedNominalVoltages] = useState(
            []
        );

        const handleNominalVoltageChange = useCallback((selectedTensionIds) => {
            setSelectedNominalVoltages(selectedTensionIds);
        }, []);

        // --- country (i.e. countryCode) => lookup actually in substation --- //
        const [countries, setCountries] = useState([]);
        const [selectedCountries, setSelectedCountries] = useState([]);
        const handleCountryChange = useCallback((selectedCountries) => {
            setSelectedCountries(selectedCountries);
        }, []);

        const getExpertRules = (
            voltageLevelIds,
            countries,
            nominalVoltages
        ) => {
            return {
                combinator: CombinatorType.AND,
                dataType: DataType.COMBINATOR,
                rules: [],
            };
        };

        // load countries
        useEffect(() => {
            fetchAllCountries(studyUuid, currentNode.id)
                .then((countryCodes) => {
                    // update countries states
                    setCountries(countryCodes);

                    // update loading state
                    setCountriesFilterReady(true);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'DynamicSimulationFetchCountryError',
                    });
                });
        }, [currentNode.id, studyUuid, snackError]);

        // fetching and filtering equipments by filters
        const loadThenFilterEquipmentsAsync = useCallback(() => {
            const expertFilter = {
                type: 'EXPERT',
                equipmentType: equipmentType.type,
                rules: getExpertRules(
                    selectedVoltageLevelIds,
                    selectedCountries,
                    selectedNominalVoltages
                ),
            };
            // evaluate by filter-server
            return evaluateFilter(studyUuid, currentNode.id, expertFilter)
                .then((equipments) => {
                    // take only ids when return
                    return equipments.map((elem) => ({ id: elem.id }));
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'DynamicSimulationFetchEquipmentError',
                    });
                });
        }, [
            studyUuid,
            currentNode.id,
            equipmentType.type,
            snackError,
            selectedVoltageLevelIds,
            selectedCountries,
            selectedNominalVoltages,
        ]);

        useEffect(() => {
            if (gridReady && countriesFilterReady) {
                loadThenFilterEquipmentsAsync().then((equipments) => {
                    setEquipmentRowData(equipments);
                });
            }
        }, [loadThenFilterEquipmentsAsync, gridReady, countriesFilterReady]);

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
                            value={equipmentType}
                            onChange={handleEquipmentTypeChange}
                            size="small"
                            sx={{ width: '100%' }}
                        >
                            {Object.entries(CURVE_EQUIPMENT_TYPES).map(
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
                        <VirtualizedCheckboxAutocomplete
                            value={selectedVoltageLevelIds}
                            options={voltageLevelIds}
                            getOptionLabel={(value) =>
                                mapEquipments.getVoltageLevel(value)?.name ??
                                value
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
                            options={nominalVoltages}
                            getOptionLabel={(value) =>
                                `${value} ${NOMINAL_VOLTAGE_UNIT}`
                            }
                            value={selectedNominalVoltages}
                            onChange={handleNominalVoltageChange}
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
                            {` (${selectedRowsLength} / ${
                                equipmentRowData?.length ?? 0
                            })`}
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
