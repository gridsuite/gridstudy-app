/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { PartialDeep } from 'type-fest';
import type { UUID } from 'crypto';
import { backendFetchJson, backendFetch } from '../utils';
import { getStudyUrl } from './index';
import type { SpreadsheetPartialData } from '../../components/spreadsheet-view/types/SpreadsheetPartialData';

export function fetchSpreadsheetParameters(studyUuid: UUID): Promise<SpreadsheetPartialData> {
    return backendFetchJson(`${getStudyUrl(studyUuid)}/spreadsheet/parameters`);
}

export function updateSpreadsheetParameters(
    studyUuid: UUID,
    parameters: PartialDeep<SpreadsheetPartialData>
): Promise<void> {
    return backendFetch(`${getStudyUrl(studyUuid)}/spreadsheet/parameters`, {
        method: 'PUT',
        body: JSON.stringify(parameters),
    });
}
