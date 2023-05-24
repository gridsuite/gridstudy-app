/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson, getRequestParamFromList } from '../utils/rest-api';

const PREFIX_DIRECTORY_SERVER_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/directory`;

export function fetchRootFolders(types) {
    console.info('Fetching Root Directories');

    // Add params to Url
    const typesParams = getRequestParamFromList(types, 'elementTypes');
    const urlSearchParams = new URLSearchParams(typesParams);

    const fetchRootFoldersUrl = `${PREFIX_DIRECTORY_SERVER_QUERIES}/v1/root-directories?${urlSearchParams}`;
    return backendFetchJson(fetchRootFoldersUrl);
}

export function fetchDirectoryContent(directoryUuid, types) {
    console.info("Fetching Folder content '%s'", directoryUuid);

    // Add params to Url
    const typesParams = getRequestParamFromList(types, 'elementTypes');
    const urlSearchParams = new URLSearchParams(typesParams);

    const fetchDirectoryContentUrl = `${PREFIX_DIRECTORY_SERVER_QUERIES}/v1/directories/${directoryUuid}/elements?${urlSearchParams}`;
    return backendFetchJson(fetchDirectoryContentUrl);
}

function getPathUrl(studyUuid) {
    return `${PREFIX_DIRECTORY_SERVER_QUERIES}/v1/elements/${encodeURIComponent(
        studyUuid
    )}/path`;
}

export function fetchPath(studyUuid) {
    console.info(`Fetching element '${studyUuid}' and its parents info ...`);
    const fetchPathUrl = getPathUrl(studyUuid);
    console.debug(fetchPathUrl);
    return backendFetchJson(fetchPathUrl);
}

export function fetchContingencyAndFiltersLists(listIds) {
    console.info('Fetching contingency and filters lists');

    // Add params to Url
    const idsParams = getRequestParamFromList(
        listIds.filter((id) => id), // filter falsy elements
        'ids'
    );
    const urlSearchParams = new URLSearchParams(idsParams);

    urlSearchParams.append('strictMode', 'false');

    const url = `${PREFIX_DIRECTORY_SERVER_QUERIES}/v1/elements?${urlSearchParams}`;
    console.debug(url);
    return backendFetchJson(url);
}
