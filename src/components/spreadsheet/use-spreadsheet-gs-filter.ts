/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { IRowNode } from 'ag-grid-community';
import { evaluateFilters, ExpertFilter } from '../../services/study/filter';
import { UUID } from 'crypto';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';

export const useSpreadsheetGsFilter = (tabUuid: UUID) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const [filterIds, setFilterIds] = useState<string[]>([]);
    const gsFilterSpreadsheetState = useSelector((state: AppState) => state.gsFilterSpreadsheetState);

    const applyGsFilter = useCallback(
        async (filters: ExpertFilter[]) => {
            if (!filters?.length || !currentRootNetworkUuid) {
                setFilterIds([]);
                return;
            }

            const filtersUuid = filters.filter((filter) => filter.id).map((filter) => filter.id as UUID);
            if (filtersUuid.length > 0) {
                const response = await evaluateFilters(studyUuid as UUID, currentRootNetworkUuid, filtersUuid);
                const equipmentsIds = response.flatMap((filterEquipments) =>
                    filterEquipments.identifiableAttributes.map((attr) => attr.id)
                );
                setFilterIds(equipmentsIds);
            }
        },
        [currentRootNetworkUuid, studyUuid]
    );

    useEffect(() => {
        applyGsFilter(gsFilterSpreadsheetState[tabUuid]);
    }, [applyGsFilter, tabUuid, gsFilterSpreadsheetState]);

    const doesFormulaFilteringPass = useCallback((node: IRowNode) => filterIds.includes(node.data.id), [filterIds]);

    const isExternalFilterPresent = useCallback(
        () => gsFilterSpreadsheetState[tabUuid]?.length > 0,
        [tabUuid, gsFilterSpreadsheetState]
    );

    return { doesFormulaFilteringPass, isExternalFilterPresent };
};
