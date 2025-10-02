/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type RefObject, useCallback, useEffect, useState } from 'react';
import { type FilterChangedEvent, type IRowNode } from 'ag-grid-community';
import type { UUID } from 'crypto';
import { useSelector } from 'react-redux';
import { type AppState } from '../../../../../redux/reducer';
import { evaluateFilters, evaluateJsonFilter } from '../../../../../services/study/filter';
import { buildExpertFilter } from '../../../../dialogs/parameters/dynamicsimulation/curve/dialog/curve-selector-utils';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import type { GlobalFilter } from '../../../../global-filter/types';
import { type AgGridReact } from 'ag-grid-react';
import { ROW_INDEX_COLUMN_ID } from '../../../constants';
import type { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import { useSnackMessage } from '@gridsuite/commons-ui';

async function buildAndEvaluateFilter(
    equipmentType: EQUIPMENT_TYPES,
    countries: string[],
    nominalVoltages: number[],
    substationProperties: Record<string, string[]>,
    idsByEqType: Record<string, string[]>,
    studyUuid: UUID,
    currentNodeId: UUID,
    currentRootNetworkUuid: UUID
) {
    const computedFilter = buildExpertFilter(
        equipmentType,
        undefined,
        countries,
        nominalVoltages,
        substationProperties,
        idsByEqType
    );
    if (computedFilter.rules.rules && computedFilter.rules.rules.length > 0) {
        return await evaluateJsonFilter(studyUuid, currentNodeId, currentRootNetworkUuid, computedFilter);
    } else {
        return [] as Awaited<ReturnType<typeof evaluateJsonFilter>>;
    }
}

export const refreshSpreadsheetAfterFilterChanged = (event: FilterChangedEvent) => {
    event.api.refreshCells({ columns: [ROW_INDEX_COLUMN_ID], force: true });
};

export const useSpreadsheetGlobalFilter = (
    gridRef: RefObject<AgGridReact>,
    tabUuid: UUID,
    equipmentType: SpreadsheetEquipmentType
) => {
    const { snackError } = useSnackMessage();
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
                            } else if (idsByEqType[eqType].length > 0 && equipIds.length > 0) {
                                // intersection here because it is a AND
                                idsByEqType[eqType] = idsByEqType[eqType].filter((id) => equipIds.includes(id));
                            }
                        }
                    });
                }
                Promise.all(
                    (equipmentType === SpreadsheetEquipmentType.BRANCH
                        ? [SpreadsheetEquipmentType.LINE, SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER]
                        : [equipmentType]
                    ).map((eType) =>
                        buildAndEvaluateFilter(
                            eType as unknown as EQUIPMENT_TYPES,
                            countries,
                            nominalVoltages,
                            substationProperties,
                            idsByEqType,
                            studyUuid,
                            currentNode.id,
                            currentRootNetworkUuid
                        )
                    )
                ).then(
                    (values) => {
                        // we don't do a set because as equipment types are different/don't overlap, there isn't common id between types
                        setFilterIds(values.flatMap((ias) => ias.map((ia) => ia.id)));
                    },
                    (reason) => {
                        console.error('Error while evaluating the filter(s) in the spreadsheet:', reason);
                        snackError({ headerId: 'FilterEvaluationError', messageTxt: reason.message });
                    }
                );
            }
        },
        [currentNode, currentRootNetworkUuid, equipmentType, snackError, studyUuid]
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
