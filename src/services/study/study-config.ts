/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl } from './index';
import { backendFetch, backendFetchJson } from '../utils';
import { UUID } from 'crypto';
import { NetworkVisualizationParameters } from '@gridsuite/commons-ui';
import {
    ColumnStateDto,
    SpreadsheetCollectionDto,
    SpreadsheetConfig,
} from 'components/spreadsheet-view/types/spreadsheet.type';
import { GlobalFilter } from '../../components/results/common/global-filter/global-filter-types';
import { DiagramGridLayoutDto } from 'components/grid-layout/diagram-grid-layout.types';

export function getNetworkVisualizationParameters(studyUuid: UUID): Promise<NetworkVisualizationParameters> {
    console.info('get network visualization parameters');
    const url = getStudyUrl(studyUuid) + '/network-visualizations/parameters';
    console.debug(url);
    return backendFetchJson(url);
}

export function getSpreadsheetConfigCollection(studyUuid: UUID): Promise<SpreadsheetCollectionDto> {
    console.info('get spreadsheet config collection');
    const url = getStudyUrl(studyUuid) + '/spreadsheet-config-collection';
    console.debug(url);
    return backendFetchJson(url);
}

export function setSpreadsheetConfigCollection(studyUuid: UUID, spreadsheetCollection?: SpreadsheetCollectionDto) {
    console.info('set spreadsheet config collection');
    const url = getStudyUrl(studyUuid) + '/spreadsheet-config-collection';
    console.debug(url);
    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: spreadsheetCollection ? JSON.stringify(spreadsheetCollection) : null,
    });
}

export function updateStudySpreadsheetConfigCollection(studyUuid: UUID, collectionUuid: UUID, appendMode: boolean) {
    console.info('update study spreadsheet config collection');
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('collectionUuid', collectionUuid);
    urlSearchParams.append('append', String(appendMode));
    const url = getStudyUrl(studyUuid) + `/spreadsheet-config-collection?${urlSearchParams.toString()}`;
    console.debug(url);
    return backendFetchJson(url, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function reorderSpreadsheetColumns(studyUuid: UUID, spreadsheetModelUuid: UUID, columnsOrder: UUID[]) {
    const url = `${getStudyUrl(studyUuid)}/spreadsheet-config/${spreadsheetModelUuid}/columns/reorder`;
    console.debug(url);
    return backendFetch(url, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(columnsOrder),
    });
}

export function updateColumnStates(studyUuid: UUID, spreadsheetModelUuid: UUID, columnStates: ColumnStateDto[]) {
    const url = `${getStudyUrl(studyUuid)}/spreadsheet-config/${spreadsheetModelUuid}/columns/states`;
    return backendFetchJson(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(columnStates),
    });
}

export function updateSpreadsheetColumn(studyUuid: UUID, spreadsheetModelUuid: UUID, columnUuid: UUID, column: any) {
    const url = `${getStudyUrl(studyUuid)}/spreadsheet-config/${spreadsheetModelUuid}/columns/${columnUuid}`;
    return backendFetchJson(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(column),
    });
}

export function deleteSpreadsheetColumn(studyUuid: UUID, spreadsheetModelUuid: UUID, columnUuid: UUID) {
    const url = `${getStudyUrl(studyUuid)}/spreadsheet-config/${spreadsheetModelUuid}/columns/${columnUuid}`;
    return backendFetchJson(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export function duplicateSpreadsheetColumn(studyUuid: UUID, spreadsheetModelUuid: UUID, columnUuid: UUID) {
    const url = `${getStudyUrl(studyUuid)}/spreadsheet-config/${spreadsheetModelUuid}/columns/${columnUuid}/duplicate`;
    return backendFetchJson(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export function createSpreadsheetColumn(studyUuid: UUID, spreadsheetModelUuid: UUID, column: any) {
    const url = `${getStudyUrl(studyUuid)}/spreadsheet-config/${spreadsheetModelUuid}/columns`;
    return backendFetchJson(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(column),
    });
}

export function updateSpreadsheetModel(
    studyUuid: UUID,
    spreadsheetModelUuid: UUID,
    spreadsheetConfig: SpreadsheetConfig
) {
    const url = `${getStudyUrl(studyUuid)}/spreadsheet-config/${spreadsheetModelUuid}`;
    return backendFetchJson(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(spreadsheetConfig),
    });
}

export function setGlobalFiltersToSpreadsheetConfig(
    studyUuid: UUID,
    spreadsheetModelUuid: UUID,
    filters: GlobalFilter[]
) {
    const fetchUrl = `${getStudyUrl(studyUuid)}/spreadsheet-config/${spreadsheetModelUuid}/global-filters`;
    return backendFetchJson(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
    });
}

export function renameSpreadsheetModel(studyUuid: UUID, spreadsheetModelUuid: UUID, name: string) {
    const url = `${getStudyUrl(studyUuid)}/spreadsheet-config/${spreadsheetModelUuid}/name`;
    return backendFetchJson(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: name,
    });
}

export function addSpreadsheetConfigToCollection(
    studyUuid: UUID,
    collectionUuid: UUID,
    spreadsheetModel: SpreadsheetConfig
) {
    const url = `${getStudyUrl(studyUuid)}/spreadsheet-config-collection/${collectionUuid}/spreadsheet-configs`;
    return backendFetchJson(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(spreadsheetModel),
    });
}

export function removeSpreadsheetConfigFromCollection(
    studyUuid: UUID,
    collectionUuid: UUID,
    spreadsheetModelUuid: UUID
) {
    const url = `${getStudyUrl(studyUuid)}/spreadsheet-config-collection/${collectionUuid}/spreadsheet-configs/${spreadsheetModelUuid}`;
    return backendFetchJson(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export function reorderSpreadsheetConfigs(studyUuid: UUID, collectionUuid: UUID, newOrder: UUID[]) {
    const url = `${getStudyUrl(studyUuid)}/spreadsheet-config-collection/${collectionUuid}/reorder`;
    return backendFetchJson(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
    });
}

export function getDiagramGridLayout(studyUuid: UUID) {
    const fetchUrl = `${getStudyUrl(studyUuid)}/diagram-grid-layout`;
    console.debug(fetchUrl);
    return backendFetchJson(fetchUrl);
}

export function saveDiagramGridLayout(studyUuid: UUID, diagramGridLayout: DiagramGridLayoutDto) {
    const fetchUrl = `${getStudyUrl(studyUuid)}/diagram-grid-layout`;
    console.debug(fetchUrl);
    return backendFetchJson(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagramGridLayout),
    });
}

export function resetSpreadsheetColumnsFilters(studyUuid: UUID, spreadsheetModelUuid: UUID) {
    const url = `${getStudyUrl(studyUuid)}/spreadsheet-config/${spreadsheetModelUuid}/reset-filters`;
    return backendFetchJson(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
