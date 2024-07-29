/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';

//TODO move in commons-ui
export function useStateBoolean(initialState: boolean | (() => boolean)) {
    const [value, setValue] = useState<boolean>(initialState);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);
    const invert = useCallback(() => setValue((prevState) => !prevState), []);
    return { value, setTrue, setFalse, invert, setValue };
}

//TODO move in commons-ui
export function useStateNumber(initialState: number | (() => number) = 0) {
    const [value, setValue] = useState<number>(initialState);
    const increment = useCallback(
        (n: number = 1) => setValue((prevState) => prevState + n),
        []
    );
    const decrement = useCallback(
        (n: number = 1) => setValue((prevState) => prevState - n),
        []
    );
    const reset = useCallback(() => setValue(initialState), [initialState]);
    return { value, increment, decrement, reset, setValue };
}
