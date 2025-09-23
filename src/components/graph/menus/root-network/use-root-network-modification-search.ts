/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ModificationsSearchResult } from './root-network.types';
import { getModifications } from '../../../../services/root-network';
import type { UUID } from 'node:crypto';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { useSnackMessage, useDebounce } from '@gridsuite/commons-ui';

function reOrderSearchResults(
    results: ModificationsSearchResult[],
    currentNodeUuid?: UUID
): ModificationsSearchResult[] {
    if (results.length === 0) {
        return [];
    }

    const currentNodeModificationsResults = results.find((result) => result.nodeUuid === currentNodeUuid);
    if (!currentNodeModificationsResults) {
        return results;
    }

    const otherNodesModificationsResults = results.filter((r) => r.nodeUuid !== currentNodeUuid);
    return [currentNodeModificationsResults, ...otherNodesModificationsResults];
}

export const useRootNetworkModificationSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [modificationsResults, setModificationsResults] = useState<ModificationsSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const studyUuid = useSelector((s: AppState) => s.studyUuid);
    const currentRootNetworkUuid = useSelector((s: AppState) => s.currentRootNetworkUuid);
    const currentNode = useSelector((s: AppState) => s.currentTreeNode);
    const { snackError } = useSnackMessage();

    const reset = useCallback(() => {
        setSearchTerm('');
        setModificationsResults([]);
    }, []);

    const searchMatchingElements = useCallback(
        (searchTerm: string) => {
            // Only proceed if term is not empty
            if (!searchTerm.trim()) {
                setModificationsResults([]);
                setIsLoading(false);
                return;
            }
            if (studyUuid && currentRootNetworkUuid) {
                getModifications(studyUuid, currentRootNetworkUuid, searchTerm)
                    .then(setModificationsResults)
                    .catch((errmsg) => snackError({ messageTxt: errmsg, headerId: 'equipmentsSearchingError' }))
                    .finally(() => setIsLoading(false));
            }
        },
        [studyUuid, currentRootNetworkUuid, snackError]
    );

    const debouncedHandleChange = useDebounce(searchMatchingElements, 700);

    const search = useCallback(
        (term: string) => {
            setIsLoading(true);
            setSearchTerm(term);
            debouncedHandleChange(term);
        },
        [debouncedHandleChange]
    );

    // reorder so currentNode appears first
    const reorderedResults = useMemo(
        () => reOrderSearchResults(modificationsResults, currentNode?.id),
        [modificationsResults, currentNode?.id]
    );

    useEffect(() => {
        // We need to reset the modifications search results when changing the root network.
        if (currentRootNetworkUuid) {
            reset();
        }
    }, [currentRootNetworkUuid, reset]);

    return { searchTerm, results: reorderedResults, search, reset, isLoading };
};
