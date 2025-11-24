/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { snackWithFallback, updateConfigParameter, useSnackMessage } from '@gridsuite/commons-ui';
import { AppConfigState } from 'redux/reducer';

import { simpleConverterToString } from '@gridsuite/commons-ui';
import { APP_NAME } from '../../../utils/config-params';

// Overload for primitive types: paramValueUpdateConvertor is optional
export function useParameterState<K extends keyof AppConfigState>(
    paramName: K
): AppConfigState[K] extends boolean | number | string
    ? [AppConfigState[K], (value: AppConfigState[K]) => void]
    : never;

// Overload for non-primitive types, e.g. object, array: paramValueUpdateConvertor is required
export function useParameterState<K extends keyof AppConfigState>(
    paramName: K,
    paramValueUpdateConvertor: (value: AppConfigState[K]) => string
): [AppConfigState[K], (value: AppConfigState[K]) => void];

// Implementation
export function useParameterState<K extends keyof AppConfigState>(
    paramName: K,
    paramValueUpdateConvertor?: (value: AppConfigState[K]) => string
): [AppConfigState[K], (value: AppConfigState[K]) => void] {
    const { snackError } = useSnackMessage();

    const paramGlobalState = useSelector<AppConfigState, AppConfigState[K]>((state) => state[paramName]);

    const [paramLocalState, setParamLocalState] = useState<AppConfigState[K]>(paramGlobalState);

    useEffect(() => {
        setParamLocalState(paramGlobalState);
    }, [paramGlobalState]);

    const handleChangeParamLocalState = useCallback(
        (value: AppConfigState[K]) => {
            setParamLocalState(value);
            updateConfigParameter(
                APP_NAME,
                paramName,
                (paramValueUpdateConvertor ?? simpleConverterToString)(value)
            ).catch((error) => {
                setParamLocalState(paramGlobalState);
                snackWithFallback(snackError, error, { headerId: 'paramsChangingError' });
            });
        },
        [paramName, snackError, paramGlobalState, paramValueUpdateConvertor]
    );

    return [paramLocalState, handleChangeParamLocalState];
}
