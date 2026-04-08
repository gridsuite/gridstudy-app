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
    fetchDirectoryElementPath,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { computeFullPath } from '../../../../utils/compute-title';
import { addToGlobalFilterOptions, markNotFoundGlobalFiltersAsDeleted } from '../../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import { GlobalFilterContext } from './global-filter-context';
import { HttpStatusCode } from '../../../../utils/http-status-code';
import { TableType } from '../../../../types/custom-aggrid-types';
import { AppState } from '../../../../redux/reducer.type';

const EMPTY_ARRAY: RecentGlobalFilter[] = [];
type FilterUpdateResult = { kind: 'updated' | 'notFound'; filter: GlobalFilter } | { kind: 'unchanged' };
export default function GlobalFilterProvider({
    children,
    filterCategories,
    genericFiltersStrictMode = false,
    filterableEquipmentTypes = [],
    tableType,
    tableUuid,
}: PropsWithChildren & {
    filterCategories: FilterType[];
    genericFiltersStrictMode: boolean;
    filterableEquipmentTypes: string[];
    tableType: TableType;
    tableUuid: string;
}) {
    const dispatch = useDispatch<AppDispatch>();
    const { snackError } = useSnackMessage();

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
                      .filter((f) => f !== undefined)
                : [],
        [selectedFilterIds, globalFilterOptions]
    );

    const [openedDropdown, setOpenedDropdown] = useState(false);
    const [directoryItemSelectorOpen, setDirectoryItemSelectorOpen] = useState(false);
    // maybe a filter type or a recent filter or whatever category
    const [filterGroupSelected, setFilterGroupSelected] = useState<string>(FilterType.VOLTAGE_LEVEL);

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
                dispatch(markNotFoundGlobalFiltersAsDeleted(notFoundFilters, tableUuid));
            }
        };

        checkSelectedFilters().catch((error) => console.error(error));
    }, [dispatch, selectedGlobalFilters, tableUuid, updateGenericFilter]);

    const value = useMemo(
        () => ({
            openedDropdown,
            setOpenedDropdown,
            directoryItemSelectorOpen,
            setDirectoryItemSelectorOpen,
            filterGroupSelected,
            setFilterGroupSelected,
            globalFilterOptions,
            selectedGlobalFilters,
            recentGlobalFilters,
            filterCategories,
            genericFiltersStrictMode,
            filterableEquipmentTypes,
            tableType,
            tableUuid,
        }),
        [
            openedDropdown,
            directoryItemSelectorOpen,
            filterGroupSelected,
            globalFilterOptions,
            selectedGlobalFilters,
            recentGlobalFilters,
            filterCategories,
            genericFiltersStrictMode,
            filterableEquipmentTypes,
            tableType,
            tableUuid,
        ]
    );

    return <GlobalFilterContext.Provider value={value}>{children}</GlobalFilterContext.Provider>;
}
