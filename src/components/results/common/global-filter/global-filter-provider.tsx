/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { GlobalFilter } from './global-filter-types';
import { FilterType, isCriteriaFilter } from '../utils';
import type { UUID } from 'node:crypto';
import {
    ElementAttributes,
    fetchDirectoryElementPath,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { computeFullPath } from '../../../../utils/compute-title';
import { removeFromGlobalFilterOptions } from '../../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import { GlobalFilterContext } from './global-filter-context';
import { HttpStatusCode } from '../../../../utils/http-status-code';
import { TableType } from '../../../../types/custom-aggrid-types';
import { AppState } from '../../../../redux/reducer';

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

    const selectedFilterIds = useSelector((state: AppState) => state.tableFilters.globalFilters[tableUuid]);

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
    // may be a filter type or a recent filter or whatever category
    const [filterGroupSelected, setFilterGroupSelected] = useState<string>(FilterType.VOLTAGE_LEVEL);

    // Check the selected global filters and remove them if they do not exist anymore.
    useEffect(() => {
        const checkSelectedFilters = async () => {
            const mutableFilters: GlobalFilter[] = selectedGlobalFilters.map((filter) => ({ ...filter }));

            const genericFiltersUuids: UUID[] = mutableFilters
                .filter((globalFilter) => isCriteriaFilter(globalFilter))
                .map((globalFilter) => globalFilter.uuid)
                .filter((globalFilterUUID) => globalFilterUUID !== undefined);

            for (const genericFilterUuid of genericFiltersUuids) {
                try {
                    // checks if the generic filters still exist, and update their path value
                    const response: ElementAttributes[] = await fetchDirectoryElementPath(genericFilterUuid);
                    const parentDirectoriesNames = response.map((parent) => parent.elementName);
                    const path = computeFullPath(parentDirectoriesNames);
                    const fetchedFilter: GlobalFilter | undefined = mutableFilters.find(
                        (globalFilter) => globalFilter.uuid === genericFilterUuid
                    );
                    if (fetchedFilter && !fetchedFilter.path) {
                        fetchedFilter.path = path;
                    }
                } catch (responseError) {
                    const error = responseError as Error & { status: number };
                    if (error.status === HttpStatusCode.NOT_FOUND) {
                        // not found => remove those missing filters from global filters
                        dispatch(removeFromGlobalFilterOptions(genericFilterUuid));
                        snackError({
                            messageTxt: mutableFilters.find((filter) => filter.uuid === genericFilterUuid)?.path,
                            headerId: 'ComputationFilterResultsError',
                        });
                    } else {
                        // or whatever error => do nothing except showing error message
                        snackWithFallback(snackError, error, {
                            headerId: 'ComputationFilterResultsError',
                        });
                    }
                }
            }
        };

        checkSelectedFilters().catch((error) => console.error(error));
    }, [selectedGlobalFilters, dispatch, snackError]);

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
            filterCategories,
            genericFiltersStrictMode,
            filterableEquipmentTypes,
            tableType,
            tableUuid,
        ]
    );

    return <GlobalFilterContext.Provider value={value}>{children}</GlobalFilterContext.Provider>;
}
