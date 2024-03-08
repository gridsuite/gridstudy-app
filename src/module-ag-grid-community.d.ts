/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CrossValidationOptions } from './components/spreadsheet/utils/equipment-table-utils';
import { DISPLAY_CONVERSION } from './components/custom-aggrid/custom-aggrid-header-utils';

declare module 'ag-grid-community' {
    // used to add properties that are not supported by ColDef such as numeric, fractionDigits...
    interface ColDef {
        numeric?: boolean;
        fractionDigits?: number;
        crossValidation?: CrossValidationOptions;
        displayConversionMode?: DISPLAY_CONVERSION;
        /**
         * If true, this column is used for a secondary sort after another column which is the primary sort column
         * If false, this is a regular column which triggers a regular primary sort
         */
        secondarySort?: boolean;
    }
}
