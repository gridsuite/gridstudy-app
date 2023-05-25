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
 */
const sortByIndex = (a, b, diagramStates) => {
    return (
        diagramStates.findIndex((diagramState) => diagramState.id === a?.id) -
        diagramStates.findIndex((diagramState) => diagramState.id === b?.id)
    );
};

/**
 * Array sorting function based on two values : first, the alignment, then, the index
 * @param diagramStates the diagrams array of the redux store
 * @returns {(function(*, *): (*))|*} new array sorting function based on diagramStates
 */
export const sortDiagrams = (diagramStates) => {
    return (a, b) => {
        if (a?.align !== b?.align) {
            return sortByAlign(a, b);
        } else {
            return sortByIndex(a, b, diagramStates);
        }
    };
};
