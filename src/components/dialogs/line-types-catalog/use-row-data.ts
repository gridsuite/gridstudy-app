/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useMemo } from 'react';
import { LineTypeInfo } from './line-catalog.type';
import { CATEGORIES } from './segment-utils';

export const useRowData = (rowData: LineTypeInfo[]) => {
    const aerialRowData = useMemo(() => rowData?.filter((row) => row.category === CATEGORIES.AERIAL) || [], [rowData]);

    const undergroundRowData = useMemo(
        () => rowData?.filter((row) => row.category === CATEGORIES.UNDERGROUND) || [],
        [rowData]
    );

    return { aerialRowData, undergroundRowData };
};
