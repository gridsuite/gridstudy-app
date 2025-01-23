/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { IRowNode } from 'ag-grid-community';
import { evaluateFilters, ExpertFilter } from '../../services/study/filter';
import { UUID } from 'crypto';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';

export const useSpreadsheetGsFilter = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [filterIds, setFilterIds] = useState<string[]>([]);

    const applyGsFilter = useCallback(
        (filters: ExpertFilter[]) => {
            if (!!filters.length) {
                setFilterIds([]);
                return;
            }
            if (currentNode?.id) {
                const filtersUuid: UUID[] = filters
                    .filter((filter) => filter.id !== undefined)
                    .map((filter) => filter.id) as UUID[];
                if (!!filtersUuid.length) {
                    evaluateFilters(studyUuid as UUID, currentNode.id, filtersUuid).then((response) => {
                        const equipmentsIds: string[] = [];
                        response.forEach((filterEquipments) =>
                            filterEquipments.identifiableAttributes.map((identifiableAttribute) =>
                                equipmentsIds.push(identifiableAttribute.id)
                            )
                        );
                        setFilterIds(equipmentsIds);
                    });
                }
            }
        },
        [currentNode?.id, studyUuid]
    );

    const doesFormulaFilteringPass = useCallback(
        (node: IRowNode) => {
            return filterIds.includes(node.data.id);
        },
        [filterIds]
    );

    const isExternalFilterPresent = useCallback(() => !!filterIds.length, [filterIds.length]);

    return { applyGsFilter, doesFormulaFilteringPass, isExternalFilterPresent };
};
