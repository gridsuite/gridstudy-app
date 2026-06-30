/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { GlobalFilter, RecentGlobalFilter } from './global-filter-types';
import { FilterType, isCriteriaFilter } from '../utils';
import {
    ElementAttributes,
    ElementType,
    EquipmentType,
    fetchDirectoryElementPath,
    fetchElementsInfos,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { computeFullPath } from '../../../../utils/compute-title';
import {
    addToGlobalFilterOptions,
    addToSelectedGlobalFilters,
    clearSelectedGlobalFilters as clearSelectedGlobalFiltersAction,
    markNotFoundGlobalFiltersAsDeleted,
    removeFromGlobalFilterOptions,
    removeFromSelectedGlobalFilters,
} from '../../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import { HttpStatusCode } from '../../../../utils/http-status-code';
import { TableType } from '../../../../types/custom-aggrid-types';
import { AppState } from '../../../../redux/reducer.type';
import GlobalFilterContextProvider from './global-filter-context-provider';
import { fetchSubstationPropertiesGlobalFilters } from './global-filter-app-data';
import { useLocalizedCountries } from '../../../utils/localized-countries-hook';
import type { UUID } from 'node:crypto';

const EMPTY_ARRAY: RecentGlobalFilter[] = [];

type FilterUpdateResult = { kind: 'updated' | 'notFound'; filter: GlobalFilter } | { kind: 'unchanged' };

type GlobalFilterProviderProps = PropsWithChildren<{
    filterCategories: FilterType[];
    genericFiltersStrictMode: boolean;
    filterableEquipmentTypes: string[];
    tableType: TableType;
    tableUuid: string;
}>;

export default function GlobalFilterProvider({
    children,
    filterCategories,
    genericFiltersStrictMode = false,
    filterableEquipmentTypes = [],
    tableType,
    tableUuid,
}: Readonly<GlobalFilterProviderProps>) {
    const dispatch = useDispatch<AppDispatch>();
    const { snackError } = useSnackMessage();
    const { translate: translateCountryCode } = useLocalizedCountries();
    const [substationPropertiesGlobalFilters, setSubstationPropertiesGlobalFilters] = useState<Map<string, string[]>>();

    const globalFilterOptions = useSelector((state: AppState) => state.globalFilterOptions);

    const selectedFilterIds = useSelector((state: AppState) => state.tableFilters.globalFilters[tableUuid]?.selected);

    const recentGlobalFilters = useSelector(
        (state: AppState) => state.tableFilters.globalFilters[tableUuid]?.recents ?? EMPTY_ARRAY
    );

    const selectedGlobalFilters = useMemo(
        () =>
            selectedFilterIds
                ? selectedFilterIds
                      .map((id) => globalFilterOptions.find((opt) => opt.id === id))
                      .filter((filter): filter is GlobalFilter => filter !== undefined)
                : [],
        [selectedFilterIds, globalFilterOptions]
    );

    useEffect(() => {
        fetchSubstationPropertiesGlobalFilters().then(({ substationPropertiesGlobalFilters }) => {
            setSubstationPropertiesGlobalFilters(substationPropertiesGlobalFilters);
        });
    }, []);

    const updateGenericFilter = useCallback(
        async (genericFilter: GlobalFilter): Promise<FilterUpdateResult> => {
            try {
                if (!genericFilter.uuid) {
                    return { kind: 'unchanged' };
                }
                const response: ElementAttributes[] = await fetchDirectoryElementPath(genericFilter.uuid);
                const parentDirectoriesNames = response.map((parent) => parent.elementName);
                const label =
                    response.find((parent) => parent.type === ElementType.FILTER)?.elementName ?? genericFilter.label;
                const path = computeFullPath(parentDirectoriesNames);
                if (path !== genericFilter.path || label !== genericFilter.label) {
                    return { kind: 'updated', filter: { ...genericFilter, path, label } };
                }
                return { kind: 'unchanged' };
            } catch (responseError) {
                const error = responseError as Error & { status: number };
                if (error.status === HttpStatusCode.NOT_FOUND) {
                    return { kind: 'notFound', filter: genericFilter };
                }
                snackWithFallback(snackError, error, {
                    headerId: 'ComputationFilterResultsError',
                });
                return { kind: 'unchanged' };
            }
        },
        [snackError]
    );

    // Check the selected global filters and mark them as deleted if they no longer exist.
    useEffect(() => {
        const checkSelectedFilters = async () => {
            const genericFilters: GlobalFilter[] = selectedGlobalFilters.filter(
                (globalFilter) => isCriteriaFilter(globalFilter) && !globalFilter.deleted
            );
            const results = await Promise.all(genericFilters.map(updateGenericFilter));
            const updatedFilters: GlobalFilter[] = [];
            const notFoundFilters: GlobalFilter[] = [];
            for (const result of results) {
                if (result.kind === 'updated') updatedFilters.push(result.filter);
                else if (result.kind === 'notFound') notFoundFilters.push(result.filter);
            }
            if (updatedFilters.length) {
                dispatch(addToGlobalFilterOptions(updatedFilters));
            }
            if (notFoundFilters.length) {
                dispatch(markNotFoundGlobalFiltersAsDeleted(notFoundFilters, tableUuid, tableType));
            }
        };

        checkSelectedFilters().catch((error) => console.error(error));
    }, [dispatch, selectedGlobalFilters, tableType, tableUuid, updateGenericFilter]);

    const selectGlobalFilter = useCallback(
        (id: string) => {
            dispatch(addToSelectedGlobalFilters(tableType, tableUuid, [id]));
        },
        [dispatch, tableType, tableUuid]
    );

    const unselectGlobalFilters = useCallback(
        (ids: string[]) => {
            dispatch(removeFromSelectedGlobalFilters(tableType, tableUuid, ids));
        },
        [dispatch, tableType, tableUuid]
    );

    const clearSelectedGlobalFilters = useCallback(() => {
        dispatch(clearSelectedGlobalFiltersAction(tableType, tableUuid));
    }, [dispatch, tableType, tableUuid]);

    const removeGlobalFilterOption = useCallback(
        (id: string) => {
            dispatch(removeFromGlobalFilterOptions(id));
        },
        [dispatch]
    );

    const addFiltersToGlobalFiltersOptions = useCallback(
        async (elementIds: UUID[]) => {
            const elements: ElementAttributes[] = await fetchElementsInfos(elementIds);
            const newlySelectedFilters: GlobalFilter[] = [];
            elements.forEach((element: ElementAttributes) => {
                // ignore already selected filters and non-generic filters :
                if (!selectedGlobalFilters.find((filter) => filter.uuid && filter.uuid === element.elementUuid)) {
                    // add the others
                    const substationOrVoltageLevel =
                        element.specificMetadata?.equipmentType === EquipmentType.SUBSTATION ||
                        element.specificMetadata?.equipmentType === EquipmentType.VOLTAGE_LEVEL;
                    newlySelectedFilters.push({
                        id: element.elementUuid,
                        uuid: element.elementUuid,
                        equipmentType: element.specificMetadata?.equipmentType,
                        label: element.elementName,
                        filterType: substationOrVoltageLevel ? FilterType.SUBSTATION_OR_VL : FilterType.GENERIC_FILTER,
                        filterTypeFromMetadata: element.specificMetadata?.type,
                    });
                }
            });

            dispatch(addToGlobalFilterOptions(newlySelectedFilters));
            newlySelectedFilters.forEach((filter) =>
                dispatch(addToSelectedGlobalFilters(tableType, tableUuid, [filter.id]))
            );
        },
        [dispatch, selectedGlobalFilters, tableType, tableUuid]
    );

    return (
        <GlobalFilterContextProvider
            globalFilterOptions={globalFilterOptions}
            selectedGlobalFilters={selectedGlobalFilters}
            recentGlobalFilters={recentGlobalFilters}
            substationPropertiesGlobalFilters={substationPropertiesGlobalFilters}
            filterCategories={filterCategories}
            genericFiltersStrictMode={genericFiltersStrictMode}
            filterableEquipmentTypes={filterableEquipmentTypes}
            translateCountryCode={translateCountryCode}
            selectGlobalFilter={selectGlobalFilter}
            unselectGlobalFilters={unselectGlobalFilters}
            clearSelectedGlobalFilters={clearSelectedGlobalFilters}
            removeGlobalFilterOption={removeGlobalFilterOption}
            addFiltersToGlobalFiltersOptions={addFiltersToGlobalFiltersOptions}
        >
            {children}
        </GlobalFilterContextProvider>
    );
}
