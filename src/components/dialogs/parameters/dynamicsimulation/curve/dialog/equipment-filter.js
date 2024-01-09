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
import { Box } from '@mui/system';
import { CustomAGGrid } from '../../../../../custom-aggrid/custom-aggrid';
import { fetchAllCountries } from '../../../../../../services/study/network-map';
import { evaluateJsonFilter } from '../../../../../../services/study/filter';
import {
    CombinatorType,
    DataType,
    FieldType,
    OperatorType,
} from '../../../../filter/expert/expert-filter.type';

export const CURVE_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.GENERATOR,
    EQUIPMENT_TYPES.LOAD,
];

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

        // --- country (i.e. countryCode) => fetch from network-map-server --- //
        const [countries, setCountries] = useState([]);
        const [selectedCountries, setSelectedCountries] = useState([]);
        const handleCountryChange = useCallback((selectedCountries) => {
            setSelectedCountries(selectedCountries);
        }, []);

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
        const filteringEquipmentsAsync = useCallback(() => {
            const buildExpertRules = (
                voltageLevelIds,
                countries,
                nominalVoltages
            ) => {
                const rules = [];

                // create rule IN for voltageLevelIds
                if (voltageLevelIds && voltageLevelIds.length > 0) {
                    const voltageLevelIdsRule = {
                        field: FieldType.VOLTAGE_LEVEL_ID,
                        operator: OperatorType.IN,
                        values: voltageLevelIds,
                        dataType: DataType.STRING,
                    };
                    rules.push(voltageLevelIdsRule);
                }

                // create rule IN for countries
                if (countries && countries.length > 0) {
                    const countriesRule = {
                        field: FieldType.COUNTRY,
                        operator: OperatorType.IN,
                        values: countries,
                        dataType: DataType.ENUM,
                    };
                    rules.push(countriesRule);
                }

                // create rule IN for nominalVoltages
                if (nominalVoltages && nominalVoltages.length > 0) {
                    const nominalVoltagesRule = {
                        field: FieldType.NOMINAL_VOLTAGE,
                        operator: OperatorType.IN,
                        values: nominalVoltages,
                        dataType: DataType.NUMBER,
                    };
                    rules.push(nominalVoltagesRule);
                }

                return {
                    combinator: CombinatorType.AND,
                    dataType: DataType.COMBINATOR,
                    rules,
                };
            };

            const expertFilter = {
                type: 'EXPERT',
                equipmentType: equipmentType,
                rules: buildExpertRules(
                    selectedVoltageLevelIds,
                    selectedCountries,
                    selectedNominalVoltages
                ),
            };

            // evaluate by filter-server
            return evaluateJsonFilter(studyUuid, currentNode.id, expertFilter)
                .then((equipments) => {
                    // take only ids when return
                    return equipments.map(({ id }) => ({ id }));
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
            equipmentType,
            snackError,
            selectedVoltageLevelIds,
            selectedCountries,
            selectedNominalVoltages,
        ]);

        useEffect(() => {
            if (gridReady && countriesFilterReady) {
                equipmentsRef.current.api.showLoadingOverlay();
                filteringEquipmentsAsync().then((equipments) => {
                    setEquipmentRowData(equipments);
                    equipmentsRef.current.api.hideOverlay();
                });
            }
        }, [filteringEquipmentsAsync, gridReady, countriesFilterReady]);

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

        // config overlay when fetching from back
        const loadingOverlayComponent = (props) => {
            return <>{props.loadingMessage}</>;
        };
        const loadingOverlayComponentParams = useMemo(() => {
            return {
                loadingMessage: intl.formatMessage({ id: 'LoadingRemoteData' }),
            };
        }, [intl]);

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
                            {CURVE_EQUIPMENT_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {intl.formatMessage({ id: type })}
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
                                loadingOverlayComponent={
                                    loadingOverlayComponent
                                }
                                loadingOverlayComponentParams={
                                    loadingOverlayComponentParams
                                }
                            />
                        </Box>
                    </Grid>
                </Grid>
            </>
        );
    }
);

export default EquipmentFilter;
