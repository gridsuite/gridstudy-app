/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '@gridsuite/commons-ui';
import { SpreadsheetConfig } from 'components/spreadsheet/config/spreadsheet.type';
import { UUID } from 'crypto';

const PREFIX_STUDY_CONFIG_QUERIES = import.meta.env.VITE_API_GATEWAY + '/study-config';

function getSpreadsheetConfigUrl() {
    return `${PREFIX_STUDY_CONFIG_QUERIES}/v1/spreadsheet-configs`;
}

function getSpreadsheetConfigsCollectionsUrl() {
    return `${PREFIX_STUDY_CONFIG_QUERIES}/v1/spreadsheet-config-collections`;
}

export function getSpreadsheetModel(spreadsheetModelUuid: UUID) {
    const fetchUrl = `${getSpreadsheetConfigUrl()}/${spreadsheetModelUuid}`;
    return backendFetchJson(fetchUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export function createSpreadsheetColumn(spreadsheetModelUuid: UUID, column: any) {
    const fetchUrl = `${getSpreadsheetConfigUrl()}/${spreadsheetModelUuid}/columns`;
    return backendFetchJson(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(column),
    });
}

export function deleteSpreadsheetColumn(spreadsheetModelUuid: UUID, columnUuid: UUID) {
    const fetchUrl = `${getSpreadsheetConfigUrl()}/${spreadsheetModelUuid}/columns/${columnUuid}`;
    return backendFetchJson(fetchUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export function updateSpreadsheetColumn(spreadsheetModelUuid: UUID, columnUuid: UUID, column: any) {
    const fetchUrl = `${getSpreadsheetConfigUrl()}/${spreadsheetModelUuid}/columns/${columnUuid}`;
    return backendFetchJson(fetchUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(column),
    });
}

export function reorderSpreadsheetColumns(spreadsheetModelUuid: UUID, columnsOrder: UUID[]) {
    const fetchUrl = `${getSpreadsheetConfigUrl()}/${spreadsheetModelUuid}/columns/reorder`;
    return backendFetchJson(fetchUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(columnsOrder),
    });
}

export function renameSpreadsheetModel(spreadsheetModelUuid: UUID, name: string) {
    const fetchUrl = `${getSpreadsheetConfigUrl()}/${spreadsheetModelUuid}/name`;
    return backendFetchJson(fetchUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: name,
    });
}

export function addSpreadsheetConfigToCollection(collectionUuid: UUID, spreadsheetModel: SpreadsheetConfig) {
    const fetchUrl = `${getSpreadsheetConfigsCollectionsUrl()}/${collectionUuid}/spreadsheet-configs`;
    return backendFetchJson(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(spreadsheetModel),
    });
}

export function removeSpreadsheetConfigFromCollection(collectionUuid: UUID, spreadsheetModelUuid: UUID) {
    const fetchUrl = `${getSpreadsheetConfigsCollectionsUrl()}/${collectionUuid}/spreadsheet-configs/${spreadsheetModelUuid}`;
    return backendFetchJson(fetchUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export function reorderSpreadsheetConfigs(collectionUuid: UUID, newOrder: UUID[]) {
    const fetchUrl = `${getSpreadsheetConfigsCollectionsUrl()}/${collectionUuid}/reorder`;
    return backendFetchJson(fetchUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
    });
}

function getNetworkVisualizationsParametersUrl() {
    return `${PREFIX_STUDY_CONFIG_QUERIES}/v1/network-visualizations-params`;
}

export function fetchNetworkVisualizationsParameters(paramsUuid: UUID) {
    const fetchUrl = `${getNetworkVisualizationsParametersUrl()}/${paramsUuid}`;
    return backendFetchJson(fetchUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
