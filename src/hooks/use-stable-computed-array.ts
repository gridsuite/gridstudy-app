/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DependencyList, useMemo, useRef } from 'react';

export function useStableComputedArray<T>(compute: () => T[], deps: DependencyList): T[] {
    const prevRef = useRef<T[]>([]);

    return useMemo(() => {
        const newArray = compute();
        const prevArray = prevRef.current;

        const hasChanged = newArray.length !== prevArray.length || newArray.some((v, i) => v !== prevArray[i]);

        if (hasChanged) {
            prevRef.current = newArray;
        }

        return prevRef.current;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}