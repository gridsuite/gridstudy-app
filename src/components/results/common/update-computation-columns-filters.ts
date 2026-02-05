/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterConfig, FilterType } from '../../../types/custom-aggrid-types';
import { updateComputationResultFiltersColumn } from '../../../services/study/study-config';
import { GridApi } from 'ag-grid-community';
import { UUID } from 'node:crypto';

export const updateComputationColumnsFilters = (
    agGridApi?: GridApi,
    filters?: FilterConfig[],
    colId?: string,
    studyUuid?: UUID,
    filterType?: FilterType,
    filterSubType?: string,
    onBeforePersist?: () => void
) => {
    if (!agGridApi || !studyUuid || !filters || !colId || !filterSubType || !filterType) {
        return;
    }
    const filter = filters.find((f) => f.column === colId);
    if (!filter) return;
    onBeforePersist?.();
    const columnDto = {
        columnId: colId,
        columnFilterInfos: {
            filterDataType: filter.dataType,
            filterType: filter.type,
            filterValue: filter?.value,
            filterTolerance: filter.tolerance,
        },
    };
    updateComputationResultFiltersColumn(studyUuid, filterType, filterSubType, columnDto).then();
};
