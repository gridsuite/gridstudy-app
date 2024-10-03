/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColumnWithFormula } from 'types/custom-columns.types';

export const createDependencyGraph = (customColumnDefinitions: ColumnWithFormula[]): Map<string, Set<string>> => {
    const graph = new Map<string, Set<string>>();

    // Initialize the graph with all columns
    customColumnDefinitions.forEach((col) => {
        graph.set(col.name, new Set());
    });

    // Build the graph by adding dependencies between columns
    customColumnDefinitions.forEach((col) => {
        customColumnDefinitions.forEach((depCol) => {
            if (col.formula.includes(depCol.name) && col.name !== depCol.name) {
                graph.get(col.name)!.add(depCol.name);
            }
        });
    });

    return graph;
};

export const topologicalSort = (graph: Map<string, Set<string>>): string[] => {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>(); // Temporary set for detecting cycles

    const dfs = (node: string) => {
        if (visiting.has(node)) {
            throw new Error(`Circular dependency detected at column: ${node}`);
        }
        if (!visited.has(node)) {
            visiting.add(node); // Mark the node as currently being visited
            const dependencies = graph.get(node) || new Set();
            dependencies.forEach(dfs);
            visiting.delete(node);
            visited.add(node);
            sorted.push(node);
        }
    };

    // Start DFS from each node
    for (const node of graph.keys()) {
        if (!visited.has(node)) {
            dfs(node);
        }
    }

    return sorted;
};
