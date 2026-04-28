/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'node:crypto';
import { FilterConfig, TableType } from '../../../../types/custom-aggrid-types';
import { updateComputationResultFiltersColumn } from '../../../../services/study/study-config';

export const persistComputationColumnFilters = (
    studyUuid: UUID,
    computationType: TableType,
    computationSubType: string,
    colId: string,
    filters: FilterConfig[],
    onError: (error: unknown) => void
) => {
    const filter = filters.find((f) => f.column === colId);
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
    updateComputationResultFiltersColumn(studyUuid, computationType, computationSubType, columnFilterInfos).catch(
        (error) => {
            onError(error);
        }
    );
};
