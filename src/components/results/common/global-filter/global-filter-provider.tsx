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

    const checkAndRemoveMissingFiltersPromise = useCallback(
        async (globalFilters: GlobalFilter[]) => {
            const missingFilterUuids: UUID[] = [];
            const globalFiltersUuids: UUID[] = globalFilters
                .map((globalFilter) => globalFilter.uuid)
                .filter((globalFilterUUID) => globalFilterUUID !== undefined);

            for (const globalFilterUuid of globalFiltersUuids) {
                try {
                    // checks if the generic filters still exist, and sets their path value
                    const response: ElementAttributes[] = await fetchDirectoryElementPath(globalFilterUuid);
                    const parentDirectoriesNames = response.map((parent) => parent.elementName);
                    const path = computeFullPath(parentDirectoriesNames);
                    const fetchedFilter: GlobalFilter | undefined = globalFilters.find(
                        (globalFilter) => globalFilter.uuid === globalFilterUuid
                    );
                    if (fetchedFilter && !fetchedFilter.path) {
                        fetchedFilter.path = path;
                    }
                } catch (error) {
                    // remove those missing filters from recent global filters
                    dispatch(removeFromRecentGlobalFilters(globalFilterUuid));
                    missingFilterUuids.push(globalFilterUuid);
                    snackError({
                        messageTxt: globalFilters.find((filter) => filter.uuid === globalFilterUuid)?.path,
                        headerId: 'ComputationFilterResultsError',
                    });
                }
            }

            // Updates the "recent" filters unless they have not been found
            const validSelectedGlobalFilters: GlobalFilter[] = globalFilters.filter(
                (filter) => !filter.uuid || !missingFilterUuids.includes(filter.uuid)
            );
            dispatch(addToRecentGlobalFilters(validSelectedGlobalFilters));

            return validSelectedGlobalFilters;
        },
        [dispatch, snackError]
    );

    const onChange = useCallback(
        (globalFilters: GlobalFilter[]) => {
            // call promise to check missing filters then update internal state and propagate change to parent
            checkAndRemoveMissingFiltersPromise(globalFilters).then((validSelectedGlobalFilters) => {
                setSelectedGlobalFilters(validSelectedGlobalFilters);
                handleChange(validSelectedGlobalFilters);
            });
        },
        [checkAndRemoveMissingFiltersPromise, setSelectedGlobalFilters, handleChange]
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
