/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useDebounce, useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { updateConfigParameter } from 'services/config';

export function useParameterState(paramName: keyof ReduxState) {
    const { snackError } = useSnackMessage();

    const paramGlobalState = useSelector(
        (state: ReduxState) => state[paramName]
    );

    const [paramLocalState, setParamLocalState] = useState(paramGlobalState);

    useEffect(() => {
        setParamLocalState(paramGlobalState);
    }, [paramGlobalState]);

    const backendupdateConfigParameterCb = useCallback(
        (paramName: keyof ReduxState, newParams: any) => {
            updateConfigParameter(paramName, newParams).catch((error) => {
                setParamLocalState(paramGlobalState);
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });
        },
        [paramGlobalState, snackError]
    );

    const debouncedBackendupdateConfigParameterCb = useDebounce(
        backendupdateConfigParameterCb,
        1000
    );

    const handleChangeParamLocalState = useCallback(
        (value: any) => {
            setParamLocalState(value);
            debouncedBackendupdateConfigParameterCb(paramName, value);
        },
        [debouncedBackendupdateConfigParameterCb, paramName]
    );

    return [paramLocalState, handleChangeParamLocalState];
}
