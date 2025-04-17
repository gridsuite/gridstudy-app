/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { GlobalFilter } from './global-filter-types';
import { FilterType } from '../utils';
import { UUID } from 'crypto';
import { ElementAttributes, fetchDirectoryElementPath, useSnackMessage } from '@gridsuite/commons-ui';
import { computeFullPath } from '../../../../utils/compute-title';
import { addToRecentGlobalFilters, removeFromRecentGlobalFilters } from '../../../../redux/actions';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import { GlobalFilterContext } from './global-filter-context';
import { HttpStatusCode } from '../../../../utils/http-status-code';

export default function GlobalFilterProvider({
    children,
    onChange: handleChange,
}: PropsWithChildren & { onChange: (globalFilters: GlobalFilter[]) => void }) {
    const dispatch = useDispatch<AppDispatch>();
    const { snackError } = useSnackMessage();

    const [openedDropdown, setOpenedDropdown] = useState(false);
    const [directoryItemSelectorOpen, setDirectoryItemSelectorOpen] = useState(false);
    // may be a filter type or a recent filter or whatever category
    const [filterGroupSelected, setFilterGroupSelected] = useState<string>(FilterType.VOLTAGE_LEVEL);
    const [selectedGlobalFilters, setSelectedGlobalFilters] = useState<GlobalFilter[]>([]);

    const checkSelectedFiltersPromise = useCallback(
        async (selectedFilters: GlobalFilter[]) => {
            const notFoundGenericFilterUuids: UUID[] = [];
            const genericFiltersUuids: UUID[] = selectedFilters
                .map((globalFilter) => globalFilter.uuid)
                .filter((globalFilterUUID) => globalFilterUUID !== undefined);

            for (const genericFilterUuid of genericFiltersUuids) {
                try {
                    // checks if the generic filters still exist, and update their path value
                    const response: ElementAttributes[] = await fetchDirectoryElementPath(genericFilterUuid);
                    const parentDirectoriesNames = response.map((parent) => parent.elementName);
                    const path = computeFullPath(parentDirectoriesNames);
                    const fetchedFilter: GlobalFilter | undefined = selectedFilters.find(
                        (globalFilter) => globalFilter.uuid === genericFilterUuid
                    );
                    if (fetchedFilter && !fetchedFilter.path) {
                        fetchedFilter.path = path;
                    }
                } catch (responseError) {
                    const error = responseError as Error & { status: number };
                    if (error.status === HttpStatusCode.NOT_FOUND) {
                        // not found => remove those missing filters from recent global filters
                        dispatch(removeFromRecentGlobalFilters(genericFilterUuid));
                        notFoundGenericFilterUuids.push(genericFilterUuid);
                        snackError({
                            messageTxt: selectedFilters.find((filter) => filter.uuid === genericFilterUuid)?.path,
                            headerId: 'ComputationFilterResultsError',
                        });
                    } else {
                        // or whatever error => do nothing except showing error message
                        snackError({
                            messageTxt: error.message,
                            headerId: 'ComputationFilterResultsError',
                        });
                    }
                }
            }

            // Updates the "recent" filters unless they have not been found
            const validSelectedFilters: GlobalFilter[] = selectedFilters.filter(
                (filter) => !filter.uuid || !notFoundGenericFilterUuids.includes(filter.uuid)
            );
            dispatch(addToRecentGlobalFilters(validSelectedFilters));

            return validSelectedFilters;
        },
        [dispatch, snackError]
    );

    const onChange = useCallback(
        (selectedFilters: GlobalFilter[]) => {
            // call promise to check the existence of generic filters and remove missing ones from the favorite list
            checkSelectedFiltersPromise(selectedFilters).then((validSelectedGlobalFilters) => {
                setSelectedGlobalFilters(validSelectedGlobalFilters);
                // propagate only valid selected filters
                handleChange(validSelectedGlobalFilters);
            });
        },
        [checkSelectedFiltersPromise, setSelectedGlobalFilters, handleChange]
    );

    const value = useMemo(
        () => ({
            openedDropdown,
            setOpenedDropdown,
            directoryItemSelectorOpen,
            setDirectoryItemSelectorOpen,
            filterGroupSelected,
            setFilterGroupSelected,
            selectedGlobalFilters,
            setSelectedGlobalFilters,
            onChange,
        }),
        [openedDropdown, directoryItemSelectorOpen, filterGroupSelected, selectedGlobalFilters, onChange]
    );

    return <GlobalFilterContext.Provider value={value}>{children}</GlobalFilterContext.Provider>;
}
