/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { NonEmptyTuple } from 'type-fest';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { snackWithFallback, useDebounce, useSnackMessage } from '@gridsuite/commons-ui';
import type { GlobalFilter, GlobalFilters } from './global-filter-types';
import { evaluateGlobalFilter } from '../../../../services/study/filter';
import type { AppState } from '../../../../redux/reducer.type';
import type { FilterEquipmentType } from '../../../../types/filter-lib/filter';
import { isStatusBuilt } from '../../../graph/util/model-functions';
import { buildValidGlobalFilters } from './build-valid-global-filters';

/* Because of ESLint react-hooks/rules-of-hooks, nullable value must be managed inside the hook, because
 * React hooks can't be called conditionally and/or different order. */
/**
 * Evaluates the given global filters and returns the matching equipment ids.
 *
 * `isPending` is true between a filter change and the arrival of the corresponding ids. Callers must
 * not display data as unfiltered during that window, otherwise the rows briefly show up unfiltered.
 */
export function useGlobalFilterResults(filters: GlobalFilter[], equipmentTypes: NonEmptyTuple<FilterEquipmentType>) {
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const isTreeModelUpToDate = useSelector((state: AppState) => state.isNetworkModificationTreeModelUpToDate);
    const [filteredIds, setFilteredIds] = useState<string[]>();
    const [isPending, setIsPending] = useState(false);

    const nodeUuid = currentNode?.id;
    const canEvaluate = Boolean(
        isTreeModelUpToDate &&
        studyUuid &&
        currentRootNetworkUuid &&
        nodeUuid &&
        isStatusBuilt(currentNode?.data?.globalBuildStatus)
    );

    const globalFilters = useMemo(() => buildValidGlobalFilters(filters), [filters]);
    const shouldEvaluate = canEvaluate && globalFilters !== undefined;

    const fetchFilteredIds = useCallback(
        (globalFiltersParam: GlobalFilters, equipmentTypesParam: NonEmptyTuple<FilterEquipmentType>) => {
            if (!studyUuid || !nodeUuid || !currentRootNetworkUuid) {
                return;
            }
            evaluateGlobalFilter(studyUuid, nodeUuid, currentRootNetworkUuid, equipmentTypesParam, globalFiltersParam)
                .then(setFilteredIds)
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'FilterEvaluationError' });
                })
                .finally(() => setIsPending(false));
        },
        [currentRootNetworkUuid, nodeUuid, snackError, studyUuid]
    );

    const debouncedFetchFilteredIds = useDebounce(fetchFilteredIds);

    useEffect(() => {
        // pending from the moment the filter changes, until the debounced evaluation has resolved
        setIsPending(shouldEvaluate);
        if (shouldEvaluate && globalFilters) {
            debouncedFetchFilteredIds(globalFilters, equipmentTypes);
        }
    }, [debouncedFetchFilteredIds, equipmentTypes, globalFilters, shouldEvaluate]);

    // the previous result is kept while a new one is being evaluated, to avoid flickering the rows
    return { filteredIds, isPending };
}
