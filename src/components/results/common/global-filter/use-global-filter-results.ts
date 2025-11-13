/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { NonEmptyTuple } from 'type-fest';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import type { GlobalFilter, GlobalFilters } from './global-filter-types';
import { evaluateGlobalFilter } from '../../../../services/study/filter';
import type { AppState } from '../../../../redux/reducer';
import useGlobalFilters, { isGlobalFilterParameter } from './use-global-filters';
import type { FilterEquipmentType } from '../../../../types/filter-lib/filter';
import { isStatusBuilt } from '../../../graph/util/model-functions';

/* Because of ESLint react-hooks/rules-of-hooks, nullable value must be managed inside the hook, because
 * React hooks can't be called conditionally and/or different order. */
function useGlobalFiltersResults(
    globalFilters: GlobalFilters | undefined,
    equipmentTypes: NonEmptyTuple<FilterEquipmentType>
) {
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const [filteredIds, setFilteredIds] = useState<string[]>();
    const isTreeModelUpToDate = useSelector((state: AppState) => state.isNetworkModificationTreeModelUpToDate);

    useEffect(() => {
        if (
            isTreeModelUpToDate &&
            studyUuid &&
            currentRootNetworkUuid &&
            currentNode?.id &&
            isStatusBuilt(currentNode?.data?.globalBuildStatus) &&
            isGlobalFilterParameter(globalFilters)
        ) {
            evaluateGlobalFilter(studyUuid, currentNode.id, currentRootNetworkUuid, equipmentTypes, globalFilters)
                .then(setFilteredIds)
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'FilterEvaluationError' });
                });
        }
    }, [
        currentNode?.data?.globalBuildStatus,
        currentNode?.id,
        currentRootNetworkUuid,
        equipmentTypes,
        globalFilters,
        isTreeModelUpToDate,
        snackError,
        studyUuid,
    ]);
    return filteredIds;
}

export function useGlobalFilterResults(filters: GlobalFilter[], equipmentTypes: NonEmptyTuple<FilterEquipmentType>) {
    const { globalFilters, handleGlobalFilterChange } = useGlobalFilters();
    useEffect(() => handleGlobalFilterChange(filters), [filters, handleGlobalFilterChange]);
    return useGlobalFiltersResults(globalFilters, equipmentTypes);
}
