/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { NonEmptyTuple } from 'type-fest';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSnackMessage } from '@gridsuite/commons-ui';
import type { GlobalFilter, GlobalFilters } from './global-filter-types';
import { evaluateGlobalFilter } from '../../../../services/study/filter';
import type { AppState } from '../../../../redux/reducer';
import useGlobalFilters, { isGlobalFilterParameter } from './use-global-filters';
import type { FilterEquipmentType } from '../../../../types/filter-lib/filter';

/* Because of ESLint react-hooks/rules-of-hooks, nullable value must be managed inside the hook, because
 * React hooks can't be called conditionally and/or different order. */
function useGlobalFiltersResults(
    globalFilters: GlobalFilters | undefined,
    equipmentTypes: NonEmptyTuple<FilterEquipmentType>
) {
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNodeUuid = useSelector((state: AppState) => state.currentTreeNode?.id);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const [filteredIds, setFilteredIds] = useState<string[]>();
    useEffect(() => {
        if (studyUuid && currentRootNetworkUuid && currentNodeUuid && isGlobalFilterParameter(globalFilters)) {
            evaluateGlobalFilter(studyUuid, currentNodeUuid, currentRootNetworkUuid, equipmentTypes, globalFilters)
                .then(setFilteredIds)
                .catch((error) => {
                    console.error('Error while fetching GlobalFilter results', error);
                    snackError({ headerId: 'FilterEvaluationError', messageTxt: `${error}` });
                });
        }
    }, [currentNodeUuid, currentRootNetworkUuid, equipmentTypes, globalFilters, snackError, studyUuid]);
    return filteredIds;
}

export function useGlobalFilterResults(filters: GlobalFilter[], equipmentTypes: NonEmptyTuple<FilterEquipmentType>) {
    const { globalFilters, handleGlobalFilterChange } = useGlobalFilters();
    useEffect(() => handleGlobalFilterChange(filters), [filters, handleGlobalFilterChange]);
    return useGlobalFiltersResults(globalFilters, equipmentTypes);
}
