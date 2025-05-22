/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { IRowNode } from 'ag-grid-community';
import { UUID } from 'crypto';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';
import { evaluateFilters, evaluateJsonFilter } from '../../../../../services/study/filter';
import { buildExpertFilter } from '../../../../dialogs/parameters/dynamicsimulation/curve/dialog/curve-selector-utils';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import { GlobalFilter } from '../../../../results/common/global-filter/global-filter-types';

export const useSpreadsheetGlobalFilter = (tabUuid: UUID, equipmentType: SpreadsheetEquipmentType) => {
    const [filterIds, setFilterIds] = useState<string[]>([]);
    const globalFilterSpreadsheetState = useSelector((state: AppState) => state.globalFilterSpreadsheetState[tabUuid]);

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const applyGlobalFilter = useCallback(
        async (globalFilters: GlobalFilter[]) => {
            if (studyUuid && currentNode && currentRootNetworkUuid) {
                const countries = globalFilters
                    ?.filter((filter) => filter.filterType === 'country')
                    .map((filter) => filter.label);
                const nominalVoltages = globalFilters
                    ?.filter((filter) => filter.filterType === 'voltageLevel')
                    .map((filter) => Number(filter.label));
                const genericFilters = globalFilters?.filter((filter) => filter.filterType === 'genericFilter');

                let genericFiltersIdentifiablesIds: string[] = [];

                if (genericFilters?.length > 0) {
                    //We currently pre evaluate generic filters because expert filters can't be referenced by other expert filters as of now
                    const filtersUuids = genericFilters
                        .flatMap((filter) => filter.uuid)
                        .filter((uuid): uuid is UUID => uuid !== undefined);
                    const response = await evaluateFilters(studyUuid, currentRootNetworkUuid, filtersUuids);
                    genericFiltersIdentifiablesIds = response.flatMap((filterEquipments) =>
                        filterEquipments.identifiableAttributes.flatMap((identifiable) => identifiable.id)
                    );
                }

                const computedFilter = buildExpertFilter(
                    equipmentType,
                    undefined,
                    countries,
                    nominalVoltages,
                    genericFiltersIdentifiablesIds
                );

                if (computedFilter.rules.rules && computedFilter.rules.rules.length > 0) {
                    const identifiables = await evaluateJsonFilter(
                        studyUuid,
                        currentNode?.id,
                        currentRootNetworkUuid,
                        computedFilter
                    );
                    setFilterIds(identifiables.map((identifiable) => identifiable.id));
                } else {
                    setFilterIds([]);
                }
            }
        },
        [currentNode, currentRootNetworkUuid, equipmentType, studyUuid]
    );

    useEffect(() => {
        applyGlobalFilter(globalFilterSpreadsheetState);
    }, [applyGlobalFilter, tabUuid, globalFilterSpreadsheetState]);

    const doesFormulaFilteringPass = useCallback((node: IRowNode) => filterIds.includes(node.data.id), [filterIds]);

    const isExternalFilterPresent = useCallback(() => globalFilterSpreadsheetState?.length > 0, [globalFilterSpreadsheetState]);

    return { doesFormulaFilteringPass, isExternalFilterPresent };
};
