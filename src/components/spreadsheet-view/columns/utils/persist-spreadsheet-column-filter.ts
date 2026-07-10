/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { UUID } from 'node:crypto';
import { FilterConfig } from '../../../../types/custom-aggrid-types';
import { ColumnDefinition } from '../../types/spreadsheet.type';
import { updateSpreadsheetColumn } from 'services/study/study-config';
import { mapColDefToDto } from '../../add-spreadsheet/dialogs/add-spreadsheet-utils';

export const persistSpreadsheetColumnFilter = (
    studyUuid: UUID,
    tabUuid: UUID,
    colDef: ColumnDefinition | undefined,
    colFilter: FilterConfig | undefined,
    onError: (error: unknown) => void
) => {
    if (!colDef) {
        return;
    }
    const columnDto = mapColDefToDto(colDef, colFilter);
    updateSpreadsheetColumn(studyUuid, tabUuid, colDef.uuid, columnDto).catch((error) => {
        onError(error);
    });
};
