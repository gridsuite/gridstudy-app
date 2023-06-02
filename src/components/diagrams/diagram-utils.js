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
 * We use the id of the objects to identify their index.
 * PS : we have to check the svgType type too because the ID is not unique
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
