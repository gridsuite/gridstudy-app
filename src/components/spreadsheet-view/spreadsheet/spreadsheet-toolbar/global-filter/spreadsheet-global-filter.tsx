/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useMemo } from 'react';
import { debounce } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { SpreadsheetEquipmentType, type SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { type AppState } from '../../../../../redux/reducer';
import { setGlobalFiltersToSpreadsheetConfig } from 'services/study/study-config';
import type { GlobalFilter } from '../../../../results/common/global-filter/global-filter-types';
import { FilterType } from '../../../../results/common/utils';
import GlobalFilterSelector, {
    type GlobalFilterSelectorProps,
} from '../../../../results/common/global-filter/global-filter-selector';
import { EQUIPMENT_TYPES } from '@powsybl/network-viewer';
import { addToRecentGlobalFilters } from '../../../../../redux/actions';
import { useGlobalFilterOptions } from '../../../../results/common/global-filter/use-global-filter-options';

export type SpreadsheetGlobalFilterProps = {
    tableDefinition: SpreadsheetTabDefinition;
};

export default function SpreadsheetGlobalFilter({ tableDefinition }: Readonly<SpreadsheetGlobalFilterProps>) {
    const dispatch = useDispatch();

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const globalFilterSpreadsheetState = useSelector(
        (state: AppState) => state.globalFilterSpreadsheetState[tableDefinition.uuid]
    );
    const { countriesFilter, voltageLevelsFilter, propertiesFilter } = useGlobalFilterOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps -- useCallback received a function whose dependencies are unknown. Pass an inline function instead.
    const debouncedSetFilters = useCallback(
        debounce((uuid: UUID, filters: GlobalFilter[]) => {
            if (!studyUuid) {
                return;
            }
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

    const filters = useMemo<GlobalFilterSelectorProps['filters']>(
        () => [
            ...(tableDefinition.type === SpreadsheetEquipmentType.SUBSTATION ||
            tableDefinition.type === SpreadsheetEquipmentType.HVDC_LINE
                ? []
                : voltageLevelsFilter),
            ...countriesFilter,
            ...propertiesFilter,
        ],
        [countriesFilter, propertiesFilter, tableDefinition.type, voltageLevelsFilter]
    );

    const filterTypes = useMemo<GlobalFilterSelectorProps['filterableEquipmentTypes']>(() => {
        let fTypes = [
            ...(tableDefinition.type === SpreadsheetEquipmentType.BRANCH
                ? [EQUIPMENT_TYPES.LINE, EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER]
                : [tableDefinition.type as unknown as EQUIPMENT_TYPES]),
            EQUIPMENT_TYPES.SUBSTATION,
        ];
        if (tableDefinition.type !== SpreadsheetEquipmentType.SUBSTATION) {
            fTypes.push(EQUIPMENT_TYPES.VOLTAGE_LEVEL);
        }
        return fTypes;
    }, [tableDefinition.type]);

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
            filterableEquipmentTypes={filterTypes}
            filters={filters}
            onChange={handleFilterChange}
            preloadedGlobalFilters={globalFilterSpreadsheetState}
            genericFiltersStrictMode={true}
        />
    );
}
