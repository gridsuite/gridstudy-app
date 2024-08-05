/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { fetchMapBoxToken } from 'services/utils';

const FALLBACK_MAPBOX_TOKEN =
    'pk.eyJ1IjoiZ2VvZmphbWciLCJhIjoiY2pwbnRwcm8wMDYzMDQ4b2pieXd0bDMxNSJ9.Q4aL20nBo5CzGkrWtxroug';

export const useMapBoxToken = () => {
    const [mapBoxToken, setMapBoxToken] = useState<string>();

    useEffect(() => {
        fetchMapBoxToken().then((token) => setMapBoxToken(token || FALLBACK_MAPBOX_TOKEN));
    }, []);

    return mapBoxToken;
};
