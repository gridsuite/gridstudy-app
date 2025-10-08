/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '@gridsuite/commons-ui';
import { SpreadsheetCollectionDto, SpreadsheetConfigDto } from 'components/spreadsheet-view/types/spreadsheet.type';
import type { UUID } from 'node:crypto';

const PREFIX_STUDY_CONFIG_QUERIES = import.meta.env.VITE_API_GATEWAY + '/study-config';

function getSpreadsheetConfigUrl() {
    return `${PREFIX_STUDY_CONFIG_QUERIES}/v1/spreadsheet-configs`;
}

export function getSpreadsheetModel(spreadsheetModelUuid: UUID): Promise<SpreadsheetConfigDto> {
    const fetchUrl = `${getSpreadsheetConfigUrl()}/${spreadsheetModelUuid}`;
    return backendFetchJson(fetchUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

function getSpreadsheetConfigsCollectionsUrl() {
    return `${PREFIX_STUDY_CONFIG_QUERIES}/v1/spreadsheet-config-collections`;
}

export function getSpreadsheetConfigCollection(collectionUuid: UUID): Promise<SpreadsheetCollectionDto> {
    const fetchUrl = `${getSpreadsheetConfigsCollectionsUrl()}/${collectionUuid}`;
    return backendFetchJson(fetchUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
