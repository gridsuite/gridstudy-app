/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export type Item = {
    id: string;
    dependencies?: string[];
};

export const hasCyclicDependencies = (items: Item[]): boolean => {
    const dependenciesPerItemId = items.reduce((acc, item) => {
        acc[item.id] = item.dependencies || [];
        return acc;
    }, {} as Record<string, string[]>);

    const visited = new Set<string>();
    const stack = new Set<string>();

    // DFS function to detect cycles
    const dfs = (node: string): boolean => {
        if (stack.has(node)) {
            return true; // Cycle detected
        }
        if (visited.has(node)) {
            return false; // Already processed, no cycle from this node
        }

        visited.add(node);
        stack.add(node);

        if (dependenciesPerItemId[node]) {
            for (const dep of dependenciesPerItemId[node]) {
                if (dfs(dep)) {
                    return true;
                }
            }
        }

        stack.delete(node); // Remove from recursion stack when done
        return false;
    };

    // Run DFS from each node
    for (const item of items) {
        if (!visited.has(item.id)) {
            if (dfs(item.id)) {
                return true;
            }
        }
    }

    return false;
};
