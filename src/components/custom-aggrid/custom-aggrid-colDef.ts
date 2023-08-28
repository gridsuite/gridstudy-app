/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ColDef } from 'ag-grid-community/dist/lib/entities/colDef';

// used to add properties that are not supported by ColDef such as numeric, fractionDigits...
declare module 'ag-grid-community' {
    interface CustomAggridColDef extends ColDef {
        numeric?: boolean;
        fractionDigits?: number;
    }
}
