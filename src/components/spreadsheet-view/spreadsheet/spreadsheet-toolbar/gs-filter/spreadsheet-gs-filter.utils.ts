/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ExpertFilter, SpreadsheetGlobalFilter } from '../../../../../services/study/filter';
import { SPREADSHEET_GS_FILTER } from '../../../../utils/field-constants';

export type ExpertFilterForm = Omit<ExpertFilter, 'type' | 'equipmentType' | 'topologyKind' | 'rules'>;

export const initialSpreadsheetGsFilterForm: Record<string, ExpertFilterForm[]> = {
    [SPREADSHEET_GS_FILTER]: [],
};

export const toFormFormat = (input: SpreadsheetGlobalFilter[]): Record<string, ExpertFilterForm[]> => ({
    [SPREADSHEET_GS_FILTER]: input.map(({ filterId, name }) => ({ id: filterId, name })),
});
