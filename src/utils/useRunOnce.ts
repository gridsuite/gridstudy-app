/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef } from 'react';

/**
 * Run some function once on the component's mount during all Application life.
 * @param fn The function to run once during mount.
 *           No need to memoize as it will not be re-run either way.
 * @see https://www.perssondennis.com/articles/react-hook-use-run-once
 */
export default function useRunOnce(fn: () => void) {
    const triggered = useRef(false);
    useEffect(() => {
        if (!triggered.current) {
            fn();
            triggered.current = true;
        }
    }, [fn]);
}

/**
 * Variante of {@link useRunOnce} that ignore <code>null</code> value.
 */
export function useRunOnceNonNull(fn: null | (() => void)) {
    const triggered = useRef(false);
    useEffect(() => {
        if (!triggered.current && fn !== null) {
            fn();
            triggered.current = true;
        }
    }, [fn]);
}
