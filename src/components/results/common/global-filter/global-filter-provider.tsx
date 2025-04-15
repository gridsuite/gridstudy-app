/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren, useCallback, useState } from 'react';
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

    const checkGenericFiltersPromise = useCallback(
        async (selectedGlobalFilters: GlobalFilter[]) => {
            const notFoundFilterUuids: UUID[] = [];
            const globalFiltersUuids: UUID[] = selectedGlobalFilters
                .map((globalFilter) => globalFilter.uuid)
                .filter((globalFilterUUID) => globalFilterUUID !== undefined);

            for (const globalFilterUuid of globalFiltersUuids) {
                try {
                    // checks if the generic filters still exist, and sets their path value
                    const response: ElementAttributes[] = await fetchDirectoryElementPath(globalFilterUuid);
                    const parentDirectoriesNames = response.map((parent) => parent.elementName);
                    const path = computeFullPath(parentDirectoriesNames);
                    const fetchedFilter: GlobalFilter | undefined = selectedGlobalFilters.find(
                        (globalFilter) => globalFilter.uuid === globalFilterUuid
                    );
                    if (fetchedFilter && !fetchedFilter.path) {
                        fetchedFilter.path = path;
                    }
                } catch (responseError) {
                    const error = responseError as Error & { status: number };
                    if (error.status === HttpStatusCode.NOT_FOUND) {
                        // not found => remove those missing filters from recent global filters
                        dispatch(removeFromRecentGlobalFilters(globalFilterUuid));
                        notFoundFilterUuids.push(globalFilterUuid);
                        snackError({
                            messageTxt: selectedGlobalFilters.find((filter) => filter.uuid === globalFilterUuid)?.path,
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
            const validSelectedGlobalFilters: GlobalFilter[] = selectedGlobalFilters.filter(
                (filter) => !filter.uuid || !notFoundFilterUuids.includes(filter.uuid)
            );
            dispatch(addToRecentGlobalFilters(validSelectedGlobalFilters));

            return validSelectedGlobalFilters;
        },
        [dispatch, snackError]
    );

    const onChange = useCallback(
        (selectedGlobalFilters: GlobalFilter[]) => {
            // call promise to check not found filters and remove them from the favorite list
            checkGenericFiltersPromise(selectedGlobalFilters).then((validSelectedGlobalFilters) => {
                setSelectedGlobalFilters(validSelectedGlobalFilters);
                // propagate only valid selected filters
                handleChange(validSelectedGlobalFilters);
            });
        },
        [checkGenericFiltersPromise, setSelectedGlobalFilters, handleChange]
    );

    const value = {
        openedDropdown,
        setOpenedDropdown,
        directoryItemSelectorOpen,
        setDirectoryItemSelectorOpen,
        filterGroupSelected,
        setFilterGroupSelected,
        selectedGlobalFilters,
        setSelectedGlobalFilters,
        onChange,
    };

    return <GlobalFilterContext.Provider value={value}>{children}</GlobalFilterContext.Provider>;
}
