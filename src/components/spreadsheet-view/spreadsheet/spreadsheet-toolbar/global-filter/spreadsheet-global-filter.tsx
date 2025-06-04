/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { AppState } from '../../../../../redux/reducer';
import { setGlobalFiltersToSpreadsheetConfig } from 'services/study/study-config';
import { GlobalFilter } from '../../../../results/common/global-filter/global-filter-types';
import { fetchAllCountries, fetchAllNominalVoltages } from '../../../../../services/study/network-map';
import { FilterType } from '../../../../results/common/utils';
import GlobalFilterSelector from '../../../../results/common/global-filter/global-filter-selector';
import { EQUIPMENT_TYPES } from '@powsybl/network-viewer';
import { addToRecentGlobalFilters } from '../../../../../redux/actions';
import { fetchSubstationPropertiesGlobalFilters } from '../../../../results/common/global-filter/global-filter-utils';
import { useGlobalFilterData } from '../../../../results/common/global-filter/use-global-filter-data';

export type SpreadsheetGlobalFilterProps = {
    tableDefinition: SpreadsheetTabDefinition;
};

export default function SpreadsheetGlobalFilter({ tableDefinition }: Readonly<SpreadsheetGlobalFilterProps>) {
    const dispatch = useDispatch();

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const globalFilterSpreadsheetState = useSelector(
        (state: AppState) => state.globalFilterSpreadsheetState[tableDefinition.uuid]
    );
    const { countriesFilter, voltageLevelsFilter, propertiesFilter } = useGlobalFilterData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetFilters = useCallback(
        debounce((uuid: UUID, filters: GlobalFilter[]) => {
            if (!studyUuid) {
                return;
            }
            console.log(filters);
            setGlobalFiltersToSpreadsheetConfig(studyUuid, uuid, filters).catch((error) =>
                console.error('Failed to update global filters:', error)
            );
        }, 600),
        []
    );

    const handleFilterChange = useCallback(
        async (globalFilters: GlobalFilter[]) => {
            debouncedSetFilters(tableDefinition.uuid, globalFilters);
        },
        [debouncedSetFilters, tableDefinition.uuid]
    );

    const filters = useMemo(() => {
        if (tableDefinition.type === EQUIPMENT_TYPES.SUBSTATION) {
            return [...countriesFilter, ...propertiesFilter];
        } else {
            return [...voltageLevelsFilter, ...countriesFilter, ...propertiesFilter];
        }
    }, [countriesFilter, propertiesFilter, tableDefinition.type, voltageLevelsFilter]);

    useEffect(() => {
        if (globalFilterSpreadsheetState) {
            dispatch(
                addToRecentGlobalFilters(
                    globalFilterSpreadsheetState?.filter((filter) => filter.filterType === FilterType.GENERIC_FILTER)
                )
            );
        }
    }, [dispatch, globalFilterSpreadsheetState]);

    return (
        <GlobalFilterSelector
            filterableEquipmentTypes={[tableDefinition.type as unknown as EQUIPMENT_TYPES]}
            filters={filters}
            onChange={handleFilterChange}
            preloadedGlobalFilters={globalFilterSpreadsheetState}
            genericFiltersStrictMode={true}
        />
    );
}
