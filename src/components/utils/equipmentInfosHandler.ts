/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { PARAM_USE_NAME } from '../../utils/config-params';
import { AppState } from 'redux/reducer';
import { Identifiable } from '@gridsuite/commons-ui';

export const useNameOrId = () => {
    const useName = useSelector((state: AppState) => state[PARAM_USE_NAME]);
    const getNameOrId = useCallback(
        (infos?: Identifiable | null) => {
            if (infos) {
                const name = infos.name;
                return useName && name != null && name.trim() !== '' ? name : infos?.id;
            }
            return '';
        },
        [useName]
    );

    const getUseNameParameterKey = useCallback(() => {
        return useName ? 'name' : 'id';
    }, [useName]);

    return { getNameOrId, getUseNameParameterKey };
};
