/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useSnackMessage } from '@gridsuite/commons-ui';
import { updateConfigParameter } from 'services/config';
import type { AppState } from 'redux/reducer';
import { ALL_CONFIG_PARAMS_KEYS_TYPE } from '../../../utils/config-params';

const simpleStringConverter = <T>(value: T) => `${value}`;

// Overload for primitive types: paramValueUpdateConvertor is optional
export function useParameterState<K extends ALL_CONFIG_PARAMS_KEYS_TYPE>(
    paramName: K
): AppState[K] extends boolean | number | string ? [AppState[K], (value: AppState[K]) => void] : never;

// Overload for non-primitive types, e.g. object, array: paramValueUpdateConvertor is required
export function useParameterState<K extends ALL_CONFIG_PARAMS_KEYS_TYPE>(
    paramName: K,
    paramValueUpdateConvertor: (value: AppState[K]) => string
): [AppState[K], (value: AppState[K]) => void];

// Implementation
export function useParameterState<K extends ALL_CONFIG_PARAMS_KEYS_TYPE>(
    paramName: K,
    paramValueUpdateConvertor?: (value: AppState[K]) => string
): [AppState[K], (value: AppState[K]) => void] {
    const { snackError } = useSnackMessage();

    const paramGlobalState = useSelector<AppState, AppState[K]>((state) => state[paramName]);

    const [paramLocalState, setParamLocalState] = useState<AppState[K]>(paramGlobalState);

    useEffect(() => {
        setParamLocalState(paramGlobalState);
    }, [paramGlobalState]);

    const handleChangeParamLocalState = useCallback(
        (value: AppState[K]) => {
            setParamLocalState(value);
            updateConfigParameter(paramName, (paramValueUpdateConvertor ?? simpleStringConverter)(value)).catch(
                (error) => {
                    setParamLocalState(paramGlobalState);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsChangingError',
                    });
                }
            );
        },
        [paramName, snackError, paramGlobalState, paramValueUpdateConvertor]
    );

    return [paramLocalState, handleChangeParamLocalState];
}
