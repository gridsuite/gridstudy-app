/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { AgGridLocales, LANG_ENGLISH, LANG_FRENCH } from '@gridsuite/commons-ui';

// At the moment, only the French locale is needed
export const AggridLocales = {
    [LANG_FRENCH]: {
        noRowsToShow: 'Aucune Donnée',
    },
    [LANG_ENGLISH]: {
        noRowsToShow: 'No data',
    },
} as const satisfies AgGridLocales;
