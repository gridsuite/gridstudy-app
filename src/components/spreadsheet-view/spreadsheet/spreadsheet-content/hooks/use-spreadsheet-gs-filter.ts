/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { IRowNode } from 'ag-grid-community';
import { IdentifiableAttributes } from '../../../../../services/study/filter';
import { UUID } from 'crypto';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';

export const useSpreadsheetGsFilter = (tabUuid: UUID) => {
    const [filterIds, setFilterIds] = useState<string[]>([]);
    const gsFilterSpreadsheetState = useSelector((state: AppState) => state.gsFilterSpreadsheetState[tabUuid]);

    const applyGsFilter = useCallback(async (filters: IdentifiableAttributes[]) => {
        const filtersUuid = filters.map((filter) => filter.id);
        if (filtersUuid.length > 0) {
            setFilterIds(filtersUuid);
        }
    }, []);

    useEffect(() => {
        console.log(gsFilterSpreadsheetState);
        applyGsFilter(gsFilterSpreadsheetState);
    }, [applyGsFilter, tabUuid, gsFilterSpreadsheetState]);

    const doesFormulaFilteringPass = useCallback((node: IRowNode) => filterIds.includes(node.data.id), [filterIds]);

    const isExternalFilterPresent = useCallback(() => gsFilterSpreadsheetState?.length > 0, [gsFilterSpreadsheetState]);

    return { doesFormulaFilteringPass, isExternalFilterPresent };
};
