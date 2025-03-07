/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, MenuItem, Select, type SelectChangeEvent, type Theme, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { CustomAGGrid, useSnackMessage } from '@gridsuite/commons-ui';
import { fetchAllCountries } from '../../../../../../services/study/network-map';
import { evaluateJsonFilter, type IdentifiableAttributes } from '../../../../../../services/study/filter';
import { fetchVoltageLevelsMapInfos } from '../../../../../../services/study/network';
import CheckboxAutocomplete from '../../../../../utils/checkbox-autocomplete';
import { useLocalizedCountries } from '../../../../../utils/localized-countries-hook';
import { buildExpertFilter, CURVE_EQUIPMENT_TYPES, NOMINAL_VOLTAGE_UNIT } from './curve-selector-utils';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { AppState } from 'redux/reducer';
import { AgGridReact } from 'ag-grid-react';

export interface GetSelectedEquipmentsHandle {
    api: {
        getSelectedEquipments: () => IdentifiableAttributes[];
    };
}

interface EquipmentFilterProps {
    equipmentType: EQUIPMENT_TYPES;
    onChangeEquipmentType: (newEquipmentType: EQUIPMENT_TYPES) => void;
}

const styles = {
    grid: {
        width: '100%',
        height: '100%',
    },
    criteria: {
        width: '100%',
        height: '56px',
    },
    equipment: {
        width: '100%',
        flexGrow: 1,
    },
    equipmentTitle: (theme: Theme) => ({
        marginBottom: theme.spacing(1),
    }),
};

const EquipmentFilter = forwardRef<GetSelectedEquipmentsHandle, EquipmentFilterProps>(
    ({ equipmentType: initialEquipmentType, onChangeEquipmentType }, ref) => {
        const { snackError } = useSnackMessage();
        const [gridReady, setGridReady] = useState(false);

        const studyUuid = useSelector((state: AppState) => state.studyUuid);
        const currentNode = useSelector((state: AppState) => state.currentTreeNode);
        const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

        const intl = useIntl();
        const equipmentsRef = useRef<AgGridReact<IdentifiableAttributes>>(null);

        // --- Equipment types --- //
        const [equipmentType, setEquipmentType] = useState(initialEquipmentType);

        const handleEquipmentTypeChange = useCallback(
            (event: SelectChangeEvent) => {
                const selectedEquipmentType = event.target.value as EQUIPMENT_TYPES;
                setEquipmentType(selectedEquipmentType);
                onChangeEquipmentType(selectedEquipmentType);
            },
            [onChangeEquipmentType]
        );

        // Map of VL names by ID
        const [voltageLevelsMap, setVoltageLevelsMap] = useState(new Map<string, string | undefined>());
        const [voltageLevelIds, setVoltageLevelIds] = useState<string[]>([]);
        const [selectedVoltageLevelIds, setSelectedVoltageLevelIds] = useState<string[]>([]);

        const [nominalVoltages, setNominalVoltages] = useState<number[]>([]);
        const [selectedNominalVoltages, setSelectedNominalVoltages] = useState<number[]>([]);

        // --- country (i.e. countryCode) => fetch from network-map-server --- //
        const [countries, setCountries] = useState([]);
        const [selectedCountries, setSelectedCountries] = useState([]);
        const { translate } = useLocalizedCountries();

        // fetching options in different criterias
        useEffect(() => {
            if (!currentRootNetworkUuid || !studyUuid || !currentNode?.id) {
                return;
            }
            // Load voltage level IDs
            fetchVoltageLevelsMapInfos(studyUuid, currentNode.id, currentRootNetworkUuid)
                .then((voltageLevels) => {
                    const vlMap = new Map<string, string | undefined>();
                    const nvSet = new Set<number>();
                    voltageLevels.forEach((vl) => {
                        vlMap.set(vl.id, vl.name);
                        nvSet.add(vl.nominalV);
                    });
                    setVoltageLevelsMap(vlMap);
                    setNominalVoltages([...nvSet.values()].sort((nv1, nv2) => nv1 - nv2));
                    setVoltageLevelIds([...vlMap.keys()]);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'FetchVoltageLevelsError',
                    });
                });

            // load countries
            fetchAllCountries(studyUuid, currentNode.id, currentRootNetworkUuid)
                .then((countryCodes) => setCountries(countryCodes))
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'FetchCountryError',
                    });
                });
        }, [studyUuid, currentNode?.id, snackError, currentRootNetworkUuid]);

        // build fetcher which filters equipments
        const filteringEquipmentsFetcher = useMemo(() => {
            if (!studyUuid || !currentRootNetworkUuid || !currentNode?.id) {
                return;
            }
            const expertFilter = buildExpertFilter(
                equipmentType,
                selectedVoltageLevelIds,
                selectedCountries,
                selectedNominalVoltages
            );

            // the fetcher which evaluates a filter by filter-server
            return evaluateJsonFilter(studyUuid, currentNode.id, currentRootNetworkUuid, expertFilter);
        }, [
            studyUuid,
            currentNode?.id,
            currentRootNetworkUuid,
            equipmentType,
            selectedVoltageLevelIds,
            selectedCountries,
            selectedNominalVoltages,
        ]);

        // fetching filtered equipments
        useEffect(() => {
            let ignore = false;
            if (gridReady && filteringEquipmentsFetcher) {
                // when close dialog, the current ref may be null => so check with '?'
                equipmentsRef.current?.api.showLoadingOverlay();
                filteringEquipmentsFetcher
                    .then((equipments) => {
                        // using ignore flag to cancel fetches that do not return in order
                        if (!ignore) {
                            setEquipmentRowData(equipments);
                        }
                    })
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'FilterEvaluationError',
                        });
                    })
                    .finally(() => {
                        equipmentsRef.current?.api.hideOverlay();
                    });
            }
            return () => {
                ignore = true;
            };
        }, [filteringEquipmentsFetcher, gridReady, snackError]);

        // grid configuration
        const [equipmentRowData, setEquipmentRowData] = useState<IdentifiableAttributes[]>([]);
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

        const onGridReady = useCallback(() => {
            setGridReady(true);
        }, []);

        const handleEquipmentSelectionChanged = useCallback(() => {
            const selectedRows = equipmentsRef.current?.api.getSelectedRows();
            setSelectedRowsLength(selectedRows?.length ?? 0);
        }, []);

        // expose some api for the component by using ref
        useImperativeHandle(
            ref,
            () => ({
                api: {
                    getSelectedEquipments: () => {
                        return equipmentsRef.current?.api.getSelectedRows() ?? [];
                    },
                },
            }),
            []
        );

        // config overlay when fetching from back
        const loadingOverlayComponent = (props: { loadingMessage: string }) => {
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
                <Grid item container sx={styles.criteria}>
                    <Grid item xs={4}>
                        <Typography>
                            <FormattedMessage id={'DynamicSimulationCurveEquipmentType'}></FormattedMessage>
                        </Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <Select
                            labelId={'DynamicSimulationCurveEquipmentType'}
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
                <Grid item container sx={styles.criteria}>
                    <Grid item xs={4}>
                        <Typography>
                            <FormattedMessage id={'DynamicSimulationCurvePost'}></FormattedMessage>
                        </Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <CheckboxAutocomplete
                            id="voltage-level"
                            virtualize
                            maxSelection={10}
                            options={voltageLevelIds}
                            value={selectedVoltageLevelIds}
                            getOptionLabel={(value) => voltageLevelsMap.get(value) ?? value}
                            onChange={setSelectedVoltageLevelIds}
                        />
                    </Grid>
                </Grid>
                {/* Country */}
                <Grid item container sx={styles.criteria}>
                    <Grid item xs={4}>
                        <Typography>
                            <FormattedMessage id={'DynamicSimulationCurveCountry'}></FormattedMessage>
                        </Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <CheckboxAutocomplete
                            id="country"
                            options={countries}
                            value={selectedCountries}
                            getOptionLabel={(value) => translate(value)}
                            onChange={setSelectedCountries}
                        />
                    </Grid>
                </Grid>
                {/* Tension */}
                <Grid item container sx={styles.criteria}>
                    <Grid item xs={4}>
                        <Typography>
                            <FormattedMessage id={'DynamicSimulationCurveTension'}></FormattedMessage>
                        </Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <CheckboxAutocomplete
                            id="nominal-voltage"
                            options={nominalVoltages}
                            value={selectedNominalVoltages}
                            getOptionLabel={(value) => `${value} ${NOMINAL_VOLTAGE_UNIT}`}
                            onChange={setSelectedNominalVoltages}
                        />
                    </Grid>
                </Grid>
                {/* Equipments */}
                <Grid item container sx={styles.equipment} direction={'column'}>
                    <Grid item>
                        <Typography sx={styles.equipmentTitle} variant="subtitle1">
                            <FormattedMessage id={'DynamicSimulationCurveEquipment'}></FormattedMessage>
                            {` (${selectedRowsLength} / ${equipmentRowData?.length ?? 0})`}
                        </Typography>
                    </Grid>
                    <Grid item xs>
                        <Box sx={styles.grid}>
                            <CustomAGGrid
                                ref={equipmentsRef}
                                rowData={equipmentRowData}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowSelection={'multiple'}
                                onGridReady={onGridReady}
                                onSelectionChanged={handleEquipmentSelectionChanged}
                                loadingOverlayComponent={loadingOverlayComponent}
                                loadingOverlayComponentParams={loadingOverlayComponentParams}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </>
        );
    }
);

export default EquipmentFilter;
