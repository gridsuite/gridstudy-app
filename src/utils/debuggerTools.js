import { useEffect, useRef } from 'react';

const usePrevious = (value, initialValue) => {
    const ref = useRef(initialValue);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};
/*
 * useEffectDebuger : permet d'afficher un log pour chaque déclancement de useEffect avec les valeurs ayant changé
 */
export const useEffectDebugger = (
    dependencies,
    dependencyNames,
    tag,
    filter = () => true
) => {
    const previousDeps = usePrevious(dependencies, []);

    const changedDeps = dependencies.reduce((accum, dependency, index) => {
        if (dependency !== previousDeps[index]) {
            const keyName = dependencyNames[index] || index;
            return {
                ...accum,
                [keyName]: {
                    before: previousDeps[index],
                    after: dependency,
                },
            };
        }

        return accum;
    }, {});

    if (Object.keys(changedDeps).length && filter()) {
        console.log(`[${tag || 'use-effect-debugger'}] `, changedDeps);
    }
};

// useEffectDebugger(
//     [
//         fluxConvention,
//         intl,
//         lockedColumnsNames,
//         props.loadFlowStatus,
//         props.network,
//         reorderedTableDefinitionIndexes,
//         selectedColumnsNames,
//     ],
//     [
//         'fluxConvention',
//         'intl',
//         'lockedColumnsNames',
//         'props.loadFlowStatus',
//         'props.network',
//         'reorderedTableDefinitionIndexes',
//         'selectedColumnsNames',
//     ],
//     'HMA'
// );
