/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { PARAM_USE_NAME } from '../../utils/config-params';

export const useNameOrId = () => {
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const getNameOrId = useCallback(
        (name, id) => {
            if (useName && name && name.trim() !== '') {
                return name;
            } else {
                return id;
            }
        },
        [useName]
    );
    return { getNameOrId };
};
