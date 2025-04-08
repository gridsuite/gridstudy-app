/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { getAppName } from '../utils/config-params';
import { backendFetch, backendFetchJson } from './utils';

const PREFIX_CONFIG_QUERIES = import.meta.env.VITE_API_GATEWAY + '/config';

export function fetchConfigParameters(appName: string) {
    console.info('Fetching UI configuration params for app : ' + appName);
    const fetchParams = PREFIX_CONFIG_QUERIES + `/v1/applications/${appName}/parameters`;
    return backendFetchJson(fetchParams);
}

export function fetchConfigParameter(name: string) {
    const appName = getAppName(name);
    console.info("Fetching UI config parameter '%s' for app '%s' ", name, appName);
    const fetchParams = PREFIX_CONFIG_QUERIES + `/v1/applications/${appName}/parameters/${name}`;
    return backendFetch(fetchParams).then((response) => (response.status === 204 ? null : response.json()));
}

export function updateConfigParameter(name: string, value: string) {
    const appName = getAppName(name);
    console.info("Updating config parameter '%s=%s' for app '%s' ", name, value, appName);
    const updateParams =
        PREFIX_CONFIG_QUERIES + `/v1/applications/${appName}/parameters/${name}?value=` + encodeURIComponent(value);
    return backendFetch(updateParams, { method: 'put' });
}
