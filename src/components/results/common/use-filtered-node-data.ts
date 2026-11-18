/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo, useState } from 'react';
import { buildValidGlobalFilters, type GlobalFilter, type GlobalFilters } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { useNodeData } from '../../use-node-data';

type FilteredNodeDataQueryResult<T> = { query: object; value: T | null };

type UseFilteredNodeDataParams<T> = {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    globalFilters: GlobalFilter[];
    fetcher: (
        studyUuid: UUID,
        nodeUuid: UUID,
        rootNetworkUuid: UUID,
        globalFilters?: GlobalFilters
    ) => Promise<T | null>;
    invalidations: string[];
};

export function useFilteredNodeData<T>({
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
    globalFilters,
    fetcher: resultFetcher,
    invalidations,
}: UseFilteredNodeDataParams<T>) {
    // Only the criteria content matters: a rehydration of the same selection must not trigger a new query.
    const criteria = JSON.stringify(buildValidGlobalFilters(globalFilters) ?? null);
    const [launchedQuery, setLaunchedQuery] = useState<object>();
    const { query, nodeFetcher, queryInvalidations } = useMemo(() => {
        const query = {};
        const parsedCriteria = JSON.parse(criteria);
        const nodeFetcher = () => {
            setLaunchedQuery(query);
            return resultFetcher(studyUuid, nodeUuid, rootNetworkUuid, parsedCriteria ?? undefined).then(
                (value): FilteredNodeDataQueryResult<T> => ({ query, value })
            );
        };
        return { query, nodeFetcher, queryInvalidations: invalidations };
    }, [studyUuid, nodeUuid, rootNetworkUuid, criteria, resultFetcher, invalidations]);

    const { result: queryResult, isLoading } = useNodeData({
        studyUuid,
        nodeUuid,
        rootNetworkUuid,
        fetcher: nodeFetcher,
        invalidations: queryInvalidations,
    });

    // Hide previous criteria/context results immediately, including during the request debounce.
    const isCurrentResult = queryResult?.query === query;
    const result = isCurrentResult ? queryResult.value : undefined;
    // A failed query (no result) is settled once it has been launched and is over.
    const isSettled = isCurrentResult || (launchedQuery === query && !isLoading);
    const isLoadingResult = !isSettled || isLoading;

    return { result, isLoadingResult, criteria };
}
