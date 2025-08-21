/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce, useSnackMessage } from '@gridsuite/commons-ui';
import { ModificationsSearchResult } from './root-network.types';
import { getModifications } from '../../../../services/root-network';
import { UUID } from 'crypto';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';

export enum TAB_VALUES {
    modifications = 'MODIFICATIONS',
    nodes = 'NODES',
}

function normalizeLabel(label: string): string {
    return label.trim().toLowerCase().replace(/\s+/g, ' ');
}

function reOrderSearchResults(
    results: ModificationsSearchResult[],
    currentNodeUuid?: UUID
): ModificationsSearchResult[] {
    if (!results.length) {
        return [];
    }

    const current = results.find((r) => r.nodeUuid === currentNodeUuid);
    if (!current) {
        return results;
    }

    const others = results.filter((r) => r.nodeUuid !== currentNodeUuid);
    return [current, ...others];
}

export const useRootNetworkSearch = (tabValue: TAB_VALUES, setIsSearchActive: (v: boolean) => void) => {
    const [searchTermNodes, setSearchTermNodes] = useState('');
    const [searchTermModifications, setSearchTermModifications] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modificationsResults, setModificationsResults] = useState<ModificationsSearchResult[]>([]);
    const [nodesResults, setNodesResults] = useState<string[]>([]);

    const treeNodes = useSelector((s: AppState) => s.networkModificationTreeModel?.treeNodes);
    const currentNode = useSelector((s: AppState) => s.currentTreeNode);
    const currentRootNetworkUuid = useSelector((s: AppState) => s.currentRootNetworkUuid);
    const studyUuid = useSelector((s: AppState) => s.studyUuid);
    const { snackError } = useSnackMessage();

    const searchTerm = tabValue === TAB_VALUES.nodes ? searchTermNodes : searchTermModifications;

    const resetNodesSearch = useCallback(() => {
        setNodesResults([]);
        setSearchTermNodes('');
    }, []);

    const resetModificationsSearch = useCallback(() => {
        setModificationsResults([]);
        setSearchTermModifications('');
    }, []);

    const resetAllSearch = useCallback(() => {
        resetNodesSearch();
        resetModificationsSearch();
    }, [resetNodesSearch, resetModificationsSearch]);

    const leaveSearch = useCallback(() => {
        resetAllSearch();
        setIsSearchActive(false);
    }, [resetAllSearch, setIsSearchActive]);

    const findNodesByName = useCallback(
        (label: string) => {
            const target = normalizeLabel(label);
            if (!target) {
                return;
            }
            return treeNodes
                ?.filter((treeNode) => normalizeLabel(treeNode.data.label).includes(target))
                .map((item) => item.data.label);
        },
        [treeNodes]
    );

    const searchMatchingElements = useCallback(
        (newSearchTerm: string) => {
            if (newSearchTerm === '' || newSearchTerm?.length === 0) {
                setIsLoading(false);
                setModificationsResults([]);
                setNodesResults([]);
                return;
            }

            if (tabValue === TAB_VALUES.nodes) {
                const nodes = findNodesByName(newSearchTerm);
                if (nodes) {
                    setNodesResults(nodes);
                }
                setIsLoading(false);
            }
            if (studyUuid && currentRootNetworkUuid && tabValue === TAB_VALUES.modifications) {
                getModifications(studyUuid, currentRootNetworkUuid, newSearchTerm)
                    .then(setModificationsResults)
                    .catch((errmsg) => snackError({ messageTxt: errmsg, headerId: 'equipmentsSearchingError' }))
                    .finally(() => setIsLoading(false));
            }
        },
        [tabValue, studyUuid, currentRootNetworkUuid, findNodesByName, snackError]
    );

    const debouncedHandleChange = useDebounce(searchMatchingElements, 700);

    const handleOnChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setIsLoading(true);
            debouncedHandleChange(value);
            if (tabValue === TAB_VALUES.nodes) {
                setSearchTermNodes(value);
            } else {
                setSearchTermModifications(value);
            }
        },
        [debouncedHandleChange, tabValue]
    );

    // reorder so currentNode appears first
    const reorderedResults = useMemo(
        () => reOrderSearchResults(modificationsResults, currentNode?.id),
        [modificationsResults, currentNode?.id]
    );

    useEffect(() => {
        // We need to reset the modifications search results when changing the root network.
        if (currentRootNetworkUuid) {
            resetModificationsSearch();
        }
    }, [currentRootNetworkUuid, resetModificationsSearch]);

    return {
        searchTerm,
        handleOnChange,
        leaveSearch,
        isLoading,
        nodesResults,
        modificationsResults: reorderedResults,
        resetNodesSearch,
        resetModificationsSearch,
    };
};
