/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { NonEmptyTuple } from 'type-fest';
import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { type BuildStatus, snackWithFallback, useDebounce, useSnackMessage } from '@gridsuite/commons-ui';
import type { GlobalFilter, GlobalFilters } from './global-filter-types';
import { evaluateGlobalFilter } from '../../../../services/study/filter';
import type { AppState } from '../../../../redux/reducer.type';
import type { FilterEquipmentType } from '../../../../types/filter-lib/filter';
import { isStatusBuilt } from '../../../graph/util/model-functions';
import { buildValidGlobalFilters } from './build-valid-global-filters';

type EvaluationRequest = {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    equipmentTypes: NonEmptyTuple<FilterEquipmentType>;
    globalFilters: GlobalFilters;
    // not sent to the backend, but part of the request identity: rebuilding the node invalidates the previous result
    buildStatus: BuildStatus;
};

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
    const [evaluated, setEvaluated] = useState<{ key: string; ids: string[] }>();

    const buildStatus = currentNode?.data?.globalBuildStatus;

    /* The key identifies the evaluation by its *content*: `filters` gets a new reference whenever any
     * global filter option is added or refreshed in the store, but most of those changes leave the
     * request untouched and must not trigger another evaluation. */
    const evaluationKey = useMemo(() => {
        if (!isTreeModelUpToDate || !studyUuid || !currentRootNetworkUuid || !currentNode?.id || !buildStatus) {
            return undefined;
        }
        if (!isStatusBuilt(buildStatus)) {
            return undefined;
        }
        const globalFilters = buildValidGlobalFilters(filters);
        if (!globalFilters) {
            return undefined;
        }
        const request: EvaluationRequest = {
            studyUuid,
            nodeUuid: currentNode.id,
            rootNetworkUuid: currentRootNetworkUuid,
            equipmentTypes,
            globalFilters,
            buildStatus,
        };
        return JSON.stringify(request);
    }, [buildStatus, currentNode?.id, currentRootNetworkUuid, equipmentTypes, filters, isTreeModelUpToDate, studyUuid]);

    // derived from the key so that it stays referentially stable as long as the content doesn't change
    const evaluationRequest = useMemo(
        () => (evaluationKey ? (JSON.parse(evaluationKey) as EvaluationRequest) : undefined),
        [evaluationKey]
    );

    // the evaluation is debounced, so several requests may be in flight: only the latest one is relevant
    const latestKeyRef = useRef<string | undefined>(undefined);

    const fetchFilteredIds = useCallback(
        (key: string, request: EvaluationRequest) => {
            evaluateGlobalFilter(
                request.studyUuid,
                request.nodeUuid,
                request.rootNetworkUuid,
                request.equipmentTypes,
                request.globalFilters
            )
                .then((ids) => {
                    if (latestKeyRef.current === key) {
                        setEvaluated({ key, ids });
                    }
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'FilterEvaluationError' });
                });
        },
        [snackError]
    );

    const debouncedFetchFilteredIds = useDebounce(fetchFilteredIds);

    useEffect(() => {
        latestKeyRef.current = evaluationKey;
        if (evaluationKey && evaluationRequest) {
            debouncedFetchFilteredIds(evaluationKey, evaluationRequest);
        }
    }, [debouncedFetchFilteredIds, evaluationKey, evaluationRequest]);

    return {
        // the previous result is kept while a new one is being evaluated, to avoid flickering the rows
        filteredIds: evaluated?.ids,
        isPending: evaluationKey !== undefined && evaluated?.key !== evaluationKey,
    };
}
