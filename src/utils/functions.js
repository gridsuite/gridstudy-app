/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';

const usePrevious = (value, initialValue) => {
    const ref = useRef(initialValue);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

export const useEffectDebug = (
    effectHook,
    dependencies,
    dependencyNames = [],
    where = undefined
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

    if (Object.keys(changedDeps).length) {
        if (!where) {
            console.log('*[use-effect] ', changedDeps);
        } else {
            console.log('*[use-effect ' + where + '] ', changedDeps);
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effectHook, dependencies);
};

export const useMemoDebug = (
    memoHook,
    dependencies,
    dependencyNames = [],
    where = undefined
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

    if (Object.keys(changedDeps).length) {
        if (!where) {
            console.log('*[use-memo] ', changedDeps);
        } else {
            console.log('*[use-memo ' + where + '] ', changedDeps);
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(memoHook, dependencies);
};

export const useCallbackDebug = (
    effectHook,
    dependencies,
    dependencyNames = [],
    where = undefined
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

    if (Object.keys(changedDeps).length) {
        if (!where) {
            console.log('*[use-callback] ', changedDeps);
        } else {
            console.log('*[use-callback ' + where + '] ', changedDeps);
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(effectHook, dependencies);
};
