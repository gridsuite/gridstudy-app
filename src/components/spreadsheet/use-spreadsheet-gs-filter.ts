/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { IRowNode } from 'ag-grid-community/dist/types/core/interfaces/iRowNode';
import { evaluateFilter, ExpertFilter } from '../../services/study/filter';
import { UUID } from 'crypto';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';

export const useSpreadsheetGsFilter = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [filterIds, setFilterIds] = useState<string[]>([]);

    const applyGsFilter = useCallback(
        (filters: ExpertFilter[]) => {
            if (!filters.length) {
                setFilterIds([]);
                return;
            }
            if (currentNode?.id) {
                filters.forEach((filter) => {
                    if (filter.id) {
                        evaluateFilter(studyUuid as UUID, currentNode.id, filter.id).then((response) => {
                            setFilterIds(response.map((equipment) => equipment.id));
                        });
                    }
                });
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

    const isExternalFilterPresent = useCallback(() => filterIds.length > 0, [filterIds.length]);

    return { applyGsFilter, doesFormulaFilteringPass, isExternalFilterPresent };
};
