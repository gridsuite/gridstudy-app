/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from '@mui/material';
import { useSelector } from 'react-redux';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { AppState } from '../../../../../redux/reducer';
import { SpreadsheetGlobalFilter } from '../../../../../services/study/filter';
import { setGlobalFiltersToSpreadsheetConfig } from 'services/study/study-config';
import { GlobalFilter } from '../../../../results/common/global-filter/global-filter-types';
import { fetchAllCountries, fetchAllNominalVoltages } from '../../../../../services/study/network-map';
import { FilterType } from '../../../../results/common/utils';
import GlobalFilterSelector from '../../../../results/common/global-filter/global-filter-selector';
import { EQUIPMENT_TYPES } from '@powsybl/network-viewer';

export type SpreadsheetGsFilterProps = {
    tableDefinition: SpreadsheetTabDefinition;
};

export default function SpreadsheetGsFilter({ tableDefinition }: Readonly<SpreadsheetGsFilterProps>) {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const gsFilterSpreadsheetState = useSelector(
        (state: AppState) => state.gsFilterSpreadsheetState[tableDefinition.uuid]
    );

    const { snackError } = useSnackMessage();

    const [countriesFilter, setCountriesFilter] = useState<GlobalFilter[]>([]);
    const [voltageLevelsFilter, setVoltageLevelsFilter] = useState<GlobalFilter[]>([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetFilters = useCallback(
        debounce((uuid: UUID, filters: SpreadsheetGlobalFilter[]) => {
            if (!studyUuid) {
                return;
            }

            const formattedFilters = filters.map((filter) => ({
                filterType: filter.filterType,
                label: filter.label,
                recent: filter.recent,
                filterUuid: filter.uuid,
                equipmentType: filter.equipmentType,
                path: filter.path,
            }));
            setGlobalFiltersToSpreadsheetConfig(studyUuid, uuid, formattedFilters).catch((error) =>
                console.error('Failed to update global filters:', error)
            );
        }, 300),
        []
    );

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
            debouncedSetFilters(tableDefinition.uuid, globalFilters);
        },
        [debouncedSetFilters, tableDefinition.uuid]
    );

    const filters = useMemo(() => {
        switch (tableDefinition.type) {
            case EQUIPMENT_TYPES.SUBSTATION:
                return countriesFilter;
            default:
                return [...voltageLevelsFilter, ...countriesFilter];
        }
    }, [countriesFilter, tableDefinition.type, voltageLevelsFilter]);

    return (
        <GlobalFilterSelector
            filterableEquipmentTypes={[tableDefinition.type as unknown as EQUIPMENT_TYPES]}
            filters={filters}
            onChange={handleFilterChange}
            preloadedGlobalFilters={gsFilterSpreadsheetState}
        />
    );
}
