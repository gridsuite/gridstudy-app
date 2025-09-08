/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TreeNode } from './utils/json-schema-parser';

export const useFormulaQuickSearch = (treeData: TreeNode[], setExpandedItems: Dispatch<SetStateAction<string[]>>) => {
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

    const [matches, setMatches] = useState<TreeNode[]>([]);
    const [filter, setFilter] = useState('');

    const parentMap = useMemo(() => {
        const map: Record<string, string | null> = {};
        const build = (nodes: TreeNode[], parent: string | null = null) => {
            nodes.forEach((node) => {
                map[node.id] = parent;
                if (node.children) {
                    build(node.children, node.id);
                }
            });
        };
        build(treeData);
        return map;
    }, [treeData]);

    // collect all matches (flat list for navigation)
    const collectMatches = useCallback((nodes: TreeNode[], query: string, results: TreeNode[] = []): TreeNode[] => {
        nodes.forEach((node) => {
            if (query && node.label.toLowerCase().includes(query.toLowerCase())) {
                results.push(node);
            }
            if (node.children) {
                collectMatches(node.children, query, results);
            }
        });
        return results;
    }, []);

    useEffect(() => {
        const active = matches[currentResultIndex];
        if (!active) {
            return;
        }
        const ancestors: string[] = [];
        let parent = parentMap[active.id];
        while (parent) {
            ancestors.push(parent);
            parent = parentMap[parent];
        }
        setExpandedItems((prev) => Array.from(new Set([...prev, ...ancestors])));
    }, [currentResultIndex, matches, parentMap, setExpandedItems]);

    useEffect(() => {
        if (filter) {
            const newMatches = collectMatches(treeData, filter);
            setMatches(newMatches);
            setCurrentResultIndex(newMatches.length > 0 ? 0 : -1);
        } else {
            setMatches([]);
            setCurrentResultIndex(-1);
        }
    }, [filter, treeData, collectMatches]);

    useEffect(() => {
        const targetNode = matches[currentResultIndex];
        if (targetNode) {
            const targetEl = itemRefs.current[targetNode.id];
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [currentResultIndex, matches]);

    const handleNavigate = (direction: 'next' | 'previous') => {
        if (matches.length === 0) {
            return;
        }
        setCurrentResultIndex((prev) =>
            direction === 'next' ? (prev + 1) % matches.length : (prev - 1 + matches.length) % matches.length
        );
    };

    const handleResetSearch = () => {
        setFilter('');
        setMatches([]);
        setCurrentResultIndex(-1);
    };

    return { currentResultIndex, matches, setFilter, handleNavigate, handleResetSearch, filter, itemRefs };
};
