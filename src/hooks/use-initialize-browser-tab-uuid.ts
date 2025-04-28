/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import {
    getBrowserTabUuid,
    removeBrowserTabUuid,
    saveBrowserTabUuid,
} from '../redux/session-storage/browser-tab-uuid-state';

export default function useInitializeBrowserTabUuid() {
    useEffect(() => {
        let id = getBrowserTabUuid();

        if (!id) {
            id = crypto.randomUUID();
            saveBrowserTabUuid(id);
        }

        return () => {
            removeBrowserTabUuid();
        };
    }, []);
}
