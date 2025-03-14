/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ContingencyList } from './study/contingency-list';
import { backendFetch } from './utils';
import { UUID } from 'crypto';
import { ElementType } from '@gridsuite/commons-ui';
import { SpreadsheetCollection, SpreadsheetConfig } from 'components/spreadsheet/config/spreadsheet.type';

const PREFIX_EXPLORE_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/explore';
const PREFIX_DIRECTORY_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/directory';

export function createParameter(
    newParameter: any,
    name: string,
    parameterType: ElementType,
    description: string,
    parentDirectoryUuid: UUID
) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name', name);
    urlSearchParams.append('type', parameterType);
    urlSearchParams.append('description', description);
    urlSearchParams.append('parentDirectoryUuid', parentDirectoryUuid);
    return backendFetch(PREFIX_EXPLORE_SERVER_QUERIES + '/v1/explore/parameters?' + urlSearchParams.toString(), {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParameter),
    });
}

export function elementExists(directoryUuid: UUID, elementName: string, type: ElementType) {
    const existsElementUrl = `${PREFIX_DIRECTORY_SERVER_QUERIES}/v1/directories/${directoryUuid}/elements/${elementName}/types/${type}`;

    console.debug(existsElementUrl);
    return backendFetch(existsElementUrl, { method: 'head' }).then((response) => {
        return response.status !== 204; // HTTP 204 : No-content
    });
}

export function createCompositeModifications(
    name: string,
    description: string,
    parentDirectoryUuid: UUID,
    selectedModificationsUuid: (string | UUID)[]
) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name', name);
    urlSearchParams.append('description', description);
    urlSearchParams.append('parentDirectoryUuid', parentDirectoryUuid);
    return backendFetch(
        PREFIX_EXPLORE_SERVER_QUERIES + '/v1/explore/composite-modifications?' + urlSearchParams.toString(),
        {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedModificationsUuid),
        }
    );
}

export function createSpreadsheetModel(
    name: string,
    description: string,
    parentDirectoryUuid: UUID,
    spreadsheetConfig: SpreadsheetConfig
) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name', name);
    urlSearchParams.append('description', description);
    urlSearchParams.append('parentDirectoryUuid', parentDirectoryUuid);
    return backendFetch(
        PREFIX_EXPLORE_SERVER_QUERIES + '/v1/explore/spreadsheet-configs?' + urlSearchParams.toString(),
        {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(spreadsheetConfig),
        }
    );
}

export function saveSpreadsheetCollection(
    spreadsheetCollection: SpreadsheetCollection,
    name: string,
    description: string,
    parentDirectoryUuid: UUID
) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name', name);
    urlSearchParams.append('description', description);
    urlSearchParams.append('parentDirectoryUuid', parentDirectoryUuid);

    return backendFetch(
        PREFIX_EXPLORE_SERVER_QUERIES + '/v1/explore/spreadsheet-config-collections?' + urlSearchParams.toString(),
        {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(spreadsheetCollection),
        }
    );
}

/**
 * Create Contingency List
 * @returns {Promise<Response>}
 */
export function createContingencyList(
    newContingencyList: ContingencyList,
    contingencyListName: string,
    description: string,
    parentDirectoryUuid: string
) {
    console.info('Creating a new contingency list...');
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('description', description);
    urlSearchParams.append('parentDirectoryUuid', parentDirectoryUuid);

    const createContingencyListUrl =
        PREFIX_EXPLORE_SERVER_QUERIES +
        '/v1/explore/identifier-contingency-lists/' +
        encodeURIComponent(contingencyListName) +
        '?' +
        urlSearchParams.toString();
    return backendFetch(createContingencyListUrl, {
        method: 'post',
        body: JSON.stringify(newContingencyList),
    });
}

export interface DiagramConfigPosition {
    voltageLevelId: string;
    xposition?: number;
    yposition?: number;
    xlabelPosition?: number;
    ylabelPosition?: number;
}

export interface DiagramConfig {
    depth?: number;
    scalingFactor?: number;
    radiusFactor?: number;
    voltageLevelIds: string[];
    positions: DiagramConfigPosition[];
}

export function createDiagramConfig(
    newDiagramConfig: DiagramConfig,
    diagramConfigName: string,
    description: string,
    parentDirectoryUuid: string
) {
    console.info('Creating a new diagram config...');
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name', diagramConfigName);
    urlSearchParams.append('description', description);
    urlSearchParams.append('parentDirectoryUuid', parentDirectoryUuid);

    const createDiagramConfigUrl =
        PREFIX_EXPLORE_SERVER_QUERIES + '/v1/explore/diagram-config?' + urlSearchParams.toString();
    return backendFetch(createDiagramConfigUrl, {
        method: 'post',
        body: JSON.stringify(newDiagramConfig),
        headers: { 'Content-Type': 'application/json' },
    });
}
