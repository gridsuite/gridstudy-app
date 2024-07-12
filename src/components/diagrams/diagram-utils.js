/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * SORTING FUNCTIONS
 */

const innerSortByAlign = (align) => {
    if (align === 'left') {
        return 10;
    }
    if (align === 'right') {
        return 20;
    }
    return 30;
};

/*
 * Sorts by the object's "align" parameter. Values equal to "left" will be before "right" values, and others or undefined will be last.
 */
const sortByAlign = (a, b) => {
    return innerSortByAlign(a?.align) - innerSortByAlign(b?.align);
};

/*
 * Sort by the order (index) of the objects inside diagramStates.
 * So we keep the same order as in the redux store.
 * We use the ID and type of the objects to identify their indexes.
 */
const sortByIndex = (a, b, diagramStates) => {
    return (
        diagramStates.findIndex(
            (diagramState) =>
                diagramState.id === a?.id && diagramState.svgType === a?.svgType
        ) -
        diagramStates.findIndex(
            (diagramState) =>
                diagramState.id === b?.id && diagramState.svgType === b?.svgType
        )
    );
};

/**
 * Create an array sorting function based on two values : first, the alignment, then, the index
 * @param diagramStates the diagrams array of the redux store
 * @returns {(function(*, *): (*))|*} new array sorting function based on diagramStates
 */
export const makeDiagramSorter = (diagramStates) => {
    return (a, b) => sortByAlign(a, b) || sortByIndex(a, b, diagramStates);
};

// estimate the number of voltage levels for a requested depth
// based on the current depth and the previous number of voltage levels
// this allows the user to increase the depth quickly without having to wait
// for the actual number of voltage levels at each step but
// to avoid increasing the depth too much.
// we want this estimation to be slightly pessimistic to avoid bad UX of going to far
// and not being able to do the same thing step by step.
export function getEstimatedNbVoltageLevels(
    currentDepth,
    requestedDepth,
    previousVoltagesNB
) {
    // The coefficients are based on some tests and are not based on any scientific method.
    return previousVoltagesNB * Math.pow(2, requestedDepth - currentDepth);
}
