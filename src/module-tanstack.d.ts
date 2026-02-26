/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RefObject } from 'react';

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
        lastClickedIndex: RefObject<number | null>;
        onRowSelected?: (selectedRows: TData[]) => void;
    }
}
