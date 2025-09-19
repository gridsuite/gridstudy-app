/*
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DependencyList, useMemo, useRef } from 'react';

export function useStableComputedSet<T>(compute: () => Iterable<T>, deps: DependencyList): Set<T> {
    const prevRef = useRef<Set<T>>(new Set());

    return useMemo(() => {
        const computed = compute();
        const newSet = new Set(computed);
        const prevSet = prevRef.current;

        const hasChanged = newSet.size !== prevSet.size || [...newSet].some((v) => !prevSet.has(v));

        if (hasChanged) {
            prevRef.current = newSet;
        }

        return prevRef.current;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deps]);
}
