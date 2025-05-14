/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomColDef } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { SpreadsheetTabDefinition } from './config/spreadsheet.type';
import { AgGridReact } from 'ag-grid-react';
import { Grid, Theme } from '@mui/material';
import SpreadsheetSave from './spreadsheet-save';
import { NodeAlias } from './custom-columns/node-alias.type';
import { ColumnsConfig } from './columns-config';
import CustomColumnsConfig from './custom-columns/custom-columns-config';
import CustomColumnsNodesConfig from './custom-columns/custom-columns-nodes-config';
import GlobalFilterSelector from '../results/common/global-filter/global-filter-selector';
import { EQUIPMENT_TYPES } from '../utils/equipment-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GlobalFilter } from '../results/common/global-filter/global-filter-types';
import { fetchAllCountries, fetchAllNominalVoltages } from '../../services/study/network-map';
import { FilterType } from '../results/common/utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { evaluateFilters, evaluateJsonFilter } from '../../services/study/filter';
import { buildExpertFilter } from '../dialogs/parameters/dynamicsimulation/curve/dialog/curve-selector-utils';
import { saveSpreadsheetGsFilters } from '../../redux/actions';
import { UUID } from 'crypto';

const styles = {
    toolbar: (theme: Theme) => ({
        marginTop: theme.spacing(2),
        alignItems: 'center',
    }),
    selectColumns: (theme: Theme) => ({
        marginLeft: theme.spacing(1),
    }),
    save: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
};

interface SpreadsheetTabContentProps {
    gridRef: React.RefObject<AgGridReact>;
    tableDefinition: SpreadsheetTabDefinition;
    columns: CustomColDef[];
    nodeAliases: NodeAlias[] | undefined;
    updateNodeAliases: (nodeAliases: NodeAlias[]) => void;
    disabled: boolean;
}

export const SpreadsheetTabToolbar = ({
    gridRef,
    tableDefinition,
    columns,
    nodeAliases,
    updateNodeAliases,
    disabled,
}: SpreadsheetTabContentProps) => {
    const dispatch = useDispatch();

    const [countriesFilter, setCountriesFilter] = useState<GlobalFilter[]>([]);
    const [countries1Filter, setCountries1Filter] = useState<GlobalFilter[]>([]);
    const [countries2Filter, setCountries2Filter] = useState<GlobalFilter[]>([]);

    const [voltageLevelsFilter, setVoltageLevelsFilter] = useState<GlobalFilter[]>([]);
    const [voltageLevels1Filter, setVoltageLevels1Filter] = useState<GlobalFilter[]>([]);
    const [voltageLevels2Filter, setVoltageLevels2Filter] = useState<GlobalFilter[]>([]);

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const { snackError } = useSnackMessage();

    useEffect(() => {
        if (studyUuid && currentNode?.id && currentRootNetworkUuid) {
            fetchAllCountries(studyUuid, currentNode.id, currentRootNetworkUuid)
                .then((countryCodes) => {
                    setCountriesFilter(
                        countryCodes.map((countryCode: string) => ({
                            label: countryCode,
                            filterType: FilterType.COUNTRY,
                        }))
                    );
                    setCountries1Filter(
                        countryCodes.map((countryCode: string) => ({
                            label: countryCode,
                            filterType: FilterType.COUNTRY_1,
                        }))
                    );
                    setCountries2Filter(
                        countryCodes.map((countryCode: string) => ({
                            label: countryCode,
                            filterType: FilterType.COUNTRY_2,
                        }))
                    );
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'FetchCountryError',
                    });
                });

            fetchAllNominalVoltages(studyUuid, currentNode.id, currentRootNetworkUuid)
                .then((nominalVoltages) => {
                    setVoltageLevelsFilter(
                        nominalVoltages.map((nominalV: number) => ({
                            label: nominalV.toString(),
                            filterType: FilterType.VOLTAGE_LEVEL,
                        }))
                    );
                    setVoltageLevels1Filter(
                        nominalVoltages.map((nominalV: number) => ({
                            label: nominalV.toString(),
                            filterType: FilterType.VOLTAGE_LEVEL_1,
                        }))
                    );
                    setVoltageLevels2Filter(
                        nominalVoltages.map((nominalV: number) => ({
                            label: nominalV.toString(),
                            filterType: FilterType.VOLTAGE_LEVEL_2,
                        }))
                    );
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'FetchNominalVoltagesError',
                    });
                });
        }
    }, [studyUuid, currentRootNetworkUuid, snackError, currentNode?.id]);

    const handleFilterChange = useCallback(
        async (globalFilters: GlobalFilter[]) => {
            console.log(globalFilters);
            if (studyUuid && currentNode && currentRootNetworkUuid) {
                console.log(globalFilters);
                const countries = globalFilters
                    .filter((filter) => filter.filterType === 'country')
                    .map((filter) => filter.label);
                const countries1 = globalFilters
                    .filter((filter) => filter.filterType === 'country1')
                    .map((filter) => filter.label);
                const countries2 = globalFilters
                    .filter((filter) => filter.filterType === 'country2')
                    .map((filter) => filter.label);

                const nominalVoltages = globalFilters
                    .filter((filter) => filter.filterType === 'voltageLevel')
                    .map((filter) => Number(filter.label));
                const nominalVoltages1 = globalFilters
                    .filter((filter) => filter.filterType === 'voltageLevel1')
                    .map((filter) => Number(filter.label));
                const nominalVoltages2 = globalFilters
                    .filter((filter) => filter.filterType === 'voltageLevel2')
                    .map((filter) => Number(filter.label));
                const genericFilters = globalFilters.filter((filter) => filter.filterType === 'genericFilter');

                let genericFiltersIdentifiablesIds: string[] = [];
                if (genericFilters.length > 0) {
                    const filtersUuids = genericFilters.flatMap((filter) => filter.uuid);
                    const response = await evaluateFilters(studyUuid, currentRootNetworkUuid, filtersUuids as UUID[]);
                    genericFiltersIdentifiablesIds = response.flatMap((filterEquipments) =>
                        filterEquipments.identifiableAttributes.flatMap((identifiable) => identifiable.id)
                    );
                }

                const identifiables = await evaluateJsonFilter(
                    studyUuid,
                    currentNode?.id,
                    currentRootNetworkUuid,
                    buildExpertFilter(
                        tableDefinition.type,
                        undefined,
                        countries,
                        countries1,
                        countries2,
                        nominalVoltages,
                        nominalVoltages1,
                        nominalVoltages2,
                        genericFiltersIdentifiablesIds
                    )
                );

                dispatch(saveSpreadsheetGsFilters(tableDefinition.uuid, identifiables));
            }
        },
        [currentNode, currentRootNetworkUuid, dispatch, studyUuid, tableDefinition.type, tableDefinition.uuid]
    );

    const filters = useMemo(() => {
        switch (tableDefinition.type) {
            case EQUIPMENT_TYPES.SUBSTATION:
                return countriesFilter;
            case EQUIPMENT_TYPES.LINE:
            case EQUIPMENT_TYPES.HVDC_LINE:
            case EQUIPMENT_TYPES.TIE_LINE:
            case EQUIPMENT_TYPES.DANGLING_LINE:
            case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
            case EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER:
                return [...countries1Filter, ...countries2Filter, ...voltageLevels1Filter, ...voltageLevels2Filter];
            default:
                return [...voltageLevelsFilter, ...countriesFilter];
        }
    }, [
        countries1Filter,
        countries2Filter,
        countriesFilter,
        tableDefinition.type,
        voltageLevels1Filter,
        voltageLevels2Filter,
        voltageLevelsFilter,
    ]);

    return (
        <Grid container columnSpacing={2} sx={styles.toolbar}>
            <Grid item sx={styles.selectColumns}>
                <GlobalFilterSelector
                    filterableEquipmentTypes={[tableDefinition.type as unknown as EQUIPMENT_TYPES]}
                    filters={filters}
                    onChange={handleFilterChange}
                />
            </Grid>
            <Grid item>
                <ColumnsConfig
                    tableDefinition={tableDefinition}
                    disabled={disabled || tableDefinition?.columns.length === 0}
                />
            </Grid>
            <Grid item>
                <CustomColumnsConfig tableDefinition={tableDefinition} disabled={disabled} />
            </Grid>
            <Grid item>
                <CustomColumnsNodesConfig
                    disabled={disabled}
                    tableType={tableDefinition?.type}
                    nodeAliases={nodeAliases}
                    updateNodeAliases={updateNodeAliases}
                />
            </Grid>
            <Grid item sx={{ flexGrow: 1 }}></Grid>
            <Grid item sx={styles.save}>
                <SpreadsheetSave
                    tableDefinition={tableDefinition}
                    gridRef={gridRef}
                    columns={columns}
                    disabled={disabled}
                    nodeAliases={nodeAliases}
                />
            </Grid>
        </Grid>
    );
};
