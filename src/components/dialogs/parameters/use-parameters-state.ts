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

export type UseParameterStateParamName = keyof AppState;

export function useParameterState(paramName: UseParameterStateParamName) {
    const { snackError } = useSnackMessage();

    const paramGlobalState: any = useSelector((state: AppState) => state[paramName]);

    const [paramLocalState, setParamLocalState] = useState(paramGlobalState);

    useEffect(() => {
        setParamLocalState(paramGlobalState);
    }, [paramGlobalState]);

    const handleChangeParamLocalState = useCallback(
        (value: any) => {
            setParamLocalState(value);
            updateConfigParameter(paramName, value).catch((error) => {
                setParamLocalState(paramGlobalState);
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });
        },
        [paramName, snackError, paramGlobalState]
    );

    return [paramLocalState, handleChangeParamLocalState];
}
