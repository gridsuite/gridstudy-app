/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { GlobalFilter } from './global-filter-types';
import { FilterType, isCriteriaFilter } from '../utils';
import type { UUID } from 'node:crypto';
import {
    ElementAttributes,
    ElementType,
    fetchDirectoryElementPath,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { computeFullPath } from '../../../../utils/compute-title';
import { addToGlobalFilterOptions } from '../../../../redux/actions';
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
    // maybe a filter type or a recent filter or whatever category
    const [filterGroupSelected, setFilterGroupSelected] = useState<string>(FilterType.VOLTAGE_LEVEL);

    const updateGenericFilter = useCallback(
        async (genericFilter: GlobalFilter) => {
            try {
                const response: ElementAttributes[] = await fetchDirectoryElementPath(genericFilter.uuid as UUID);
                const parentDirectoriesNames = response.map((parent) => parent.elementName);
                const label = response.find((parent) => parent.type === ElementType.FILTER)?.elementName;
                const path = computeFullPath(parentDirectoriesNames);
                if (path !== genericFilter.path || label !== genericFilter.label) {
                    dispatch(
                        addToGlobalFilterOptions(
                            [{ ...genericFilter, path: path, label: label ?? genericFilter.label }],
                            tableType,
                            tableUuid
                        )
                    );
                }
            } catch (responseError) {
                const error = responseError as Error & { status: number };
                if (error.status === HttpStatusCode.NOT_FOUND) {
                    // Not found => updated in global filter options for display
                    dispatch(
                        addToGlobalFilterOptions(
                            [{ id: genericFilter.id, label: 'elementNotFound', filterType: genericFilter.filterType }],
                            tableType,
                            tableUuid
                        )
                    );
                } else {
                    snackWithFallback(snackError, error, {
                        headerId: 'ComputationFilterResultsError',
                    });
                }
            }
        },
        [dispatch, tableType, tableUuid, snackError]
    );

    // Check the selected global filters and remove them if they do not exist anymore.
    useEffect(() => {
        const checkSelectedFilters = async () => {
            const genericFilters = selectedGlobalFilters.filter(isCriteriaFilter);
            await Promise.all(genericFilters.map(updateGenericFilter));
        };

        checkSelectedFilters().catch((error) => console.error(error));
    }, [selectedGlobalFilters, updateGenericFilter]);

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
