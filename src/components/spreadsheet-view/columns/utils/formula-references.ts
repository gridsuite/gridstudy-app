/*
 * Copyright © 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { isAccessorNode, isConstantNode, isSymbolNode, MathNode } from 'mathjs';
import { parseFormula } from './math';

// value a formula reads as an identifier chain: 'N1.p' -> ['N1', 'p']
export type FormulaPath = string[];

const pathOf = (node: MathNode): FormulaPath | undefined => {
    if (isSymbolNode(node)) {
        return [node.name];
    }
    if (!isAccessorNode(node) || node.index.dimensions.length !== 1) {
        return undefined;
    }

    const dimension = node.index.dimensions[0];
    if (!isConstantNode(dimension) || typeof dimension.value !== 'string') {
        return undefined;
    }
    const parentPath = pathOf(node.object);
    return parentPath && [...parentPath, dimension.value];
};

const collectPaths = (node: MathNode, paths: FormulaPath[]) => {
    const path = pathOf(node);
    if (!path) {
        node.forEach((child) => collectPaths(child, paths));
        return;
    }
    paths.push(path);

    for (let current: MathNode = node; isAccessorNode(current); current = current.object) {
        current.index.dimensions
            .filter((dimension) => !isConstantNode(dimension))
            .forEach((dimension) => collectPaths(dimension, paths));
    }
};

// Nothing to analyse in a formula that doesn't parse: it produces no value
export const extractFormulaPaths = (formula: string): FormulaPath[] => {
    try {
        const paths: FormulaPath[] = [];
        collectPaths(parseFormula(formula), paths);
        return paths;
    } catch {
        return [];
    }
};
