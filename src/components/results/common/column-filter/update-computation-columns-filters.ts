/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterConfig, TableType } from '../../../../types/custom-aggrid-types';
import { updateComputationResultFiltersColumn } from '../../../../services/study/study-config';
import { UUID } from 'node:crypto';

export const persistComputationColumnFilters = (
    filters?: FilterConfig[],
    colId?: string,
    studyUuid?: UUID,
    tableType?: TableType,
    filterSubType?: string,
    onError?: (error: unknown) => void
) => {
    if (!studyUuid || !colId || !filterSubType || !tableType) {
        return;
    }
    const filter = filters?.find((f) => f.column === colId);
    const columnFilterInfos = {
        columnId: colId,
        columnFilterInfos: filter
            ? {
                  filterDataType: filter?.dataType,
                  filterType: filter?.type,
                  filterValue: JSON.stringify(filter?.value),
                  filterTolerance: filter?.tolerance,
              }
            : null,
    };
    updateComputationResultFiltersColumn(studyUuid, tableType, filterSubType, columnFilterInfos).catch((error) => {
        onError?.(error);
    });
};
