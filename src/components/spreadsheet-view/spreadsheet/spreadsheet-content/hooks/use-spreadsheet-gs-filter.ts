/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RefObject, useCallback, useEffect, useState } from 'react';
import { FilterChangedEvent, IRowNode } from 'ag-grid-community';
import { UUID } from 'crypto';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';
import { evaluateFilters, evaluateJsonFilter } from '../../../../../services/study/filter';
import { buildExpertFilter } from '../../../../dialogs/parameters/dynamicsimulation/curve/dialog/curve-selector-utils';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import { GlobalFilter } from '../../../../results/common/global-filter/global-filter-types';
import { AgGridReact } from 'ag-grid-react';
import { ROW_INDEX_COLUMN_ID } from '../../../constants';

export const refreshSpreadsheetAfterFilterChanged = (event: FilterChangedEvent) => {
    event.api.refreshCells({ columns: [ROW_INDEX_COLUMN_ID], force: true });
};

export const useSpreadsheetGlobalFilter = (
    gridRef: RefObject<AgGridReact>,
    tabUuid: UUID,
    equipmentType: SpreadsheetEquipmentType
) => {
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
                const substationProperties = globalFilters
                    ?.filter((filter) => filter.filterType === 'substationProperty')
                    .reduce<Record<string, string[]>>((acc, item) => {
                        if (item.filterSubtype) {
                            if (!acc[item.filterSubtype]) {
                                acc[item.filterSubtype] = [];
                            }
                            acc[item.filterSubtype].push(item.label);
                        }
                        return acc;
                    }, {});
                const genericFilters = globalFilters?.filter((filter) => filter.filterType === 'genericFilter');

                let idsByEqType: Record<string, string[]> = {};
                let firstInitByEqType: Record<string, boolean> = {};

                if (genericFilters?.length > 0) {
                    // We currently pre evaluate generic filters because expert filters can't be referenced by other expert filters as of now
                    const filtersUuids = genericFilters
                        .flatMap((filter) => filter.uuid)
                        .filter((uuid): uuid is UUID => uuid !== undefined);
                    const response = await evaluateFilters(
                        studyUuid,
                        currentNode.id,
                        currentRootNetworkUuid,
                        filtersUuids
                    );
                    response.forEach((filterEq) => {
                        if (filterEq.identifiableAttributes.length > 0) {
                            const eqType = filterEq.identifiableAttributes[0].type;
                            if (!idsByEqType[eqType]) {
                                idsByEqType[eqType] = [];
                                firstInitByEqType[eqType] = true;
                            }
                            const equipIds = filterEq.identifiableAttributes.map((identifiable) => identifiable.id);
                            if (idsByEqType[eqType].length === 0 && firstInitByEqType[eqType]) {
                                idsByEqType[eqType] = equipIds;
                                firstInitByEqType[eqType] = false;
                            } else {
                                // intersection here because it is a AND
                                if (idsByEqType[eqType].length > 0 && equipIds.length > 0) {
                                    idsByEqType[eqType] = idsByEqType[eqType].filter((id) => equipIds.includes(id));
                                }
                            }
                        }
                    });
                }

                const computedFilter = buildExpertFilter(
                    equipmentType,
                    undefined,
                    countries,
                    nominalVoltages,
                    substationProperties,
                    idsByEqType
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
        gridRef.current?.api?.onFilterChanged();
    }, [applyGlobalFilter, tabUuid, globalFilterSpreadsheetState, gridRef]);

    const doesFormulaFilteringPass = useCallback((node: IRowNode) => filterIds.includes(node.data.id), [filterIds]);

    const isExternalFilterPresent = useCallback(
        () => globalFilterSpreadsheetState?.length > 0,
        [globalFilterSpreadsheetState]
    );

    return { doesFormulaFilteringPass, isExternalFilterPresent };
};
