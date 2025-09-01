/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';

function normalizeLabel(label: string): string {
    return label.trim().toLowerCase().replace(/\s+/g, ' ');
}

export const useRootNetworkNodeSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [nodesResults, setNodesResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const treeNodes = useSelector((s: AppState) => s.networkModificationTreeModel?.treeNodes);

    const reset = useCallback(() => {
        setSearchTerm('');
        setNodesResults([]);
    }, []);

    const findNodesByName = useCallback(
        (label: string) => {
            const target = normalizeLabel(label);
            if (!target) {
                return [];
            }
            return (
                treeNodes
                    ?.filter((treeNode) => normalizeLabel(treeNode.data.label).includes(target))
                    .map((item) => item.data.label) ?? []
            );
        },
        [treeNodes]
    );

    const search = useCallback(
        (searchTerm: string) => {
            setIsLoading(true);
            setSearchTerm(searchTerm);

            if (!searchTerm) {
                setNodesResults([]);
                setIsLoading(false);
                return;
            }

            const nodes = findNodesByName(searchTerm);
            setNodesResults(nodes);
            setIsLoading(false);
        },
        [findNodesByName]
    );

    return { searchTerm, results: nodesResults, search, reset, isLoading };
};
