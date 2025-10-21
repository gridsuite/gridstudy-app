/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { backendFetchJson, backendFetch } from '@gridsuite/commons-ui';
import { getStudyUrl } from './index';
import type { SpreadsheetOptionalLoadingParameters } from '../../components/spreadsheet-view/types/spreadsheet.type';

export function fetchSpreadsheetParameters(studyUuid: UUID): Promise<SpreadsheetOptionalLoadingParameters> {
    return backendFetchJson(`${getStudyUrl(studyUuid)}/spreadsheet/parameters`);
}

export function updateSpreadsheetParameters(
    studyUuid: UUID,
    parameters: SpreadsheetOptionalLoadingParameters
): Promise<Response> {
    return backendFetch(`${getStudyUrl(studyUuid)}/spreadsheet/parameters`, {
        method: 'PUT',
        body: JSON.stringify(parameters),
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
