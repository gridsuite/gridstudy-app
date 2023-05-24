/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch, backendFetchJson } from '../utils/rest-api';

const PREFIX_NETWORK_MODIFICATION_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/network-modification`;

export function fetchNetworkModification(modificationUuid) {
    const modificationFetchUrl = `${PREFIX_NETWORK_MODIFICATION_QUERIES}/v1/network-modifications/${encodeURIComponent(
        modificationUuid
    )}`;
    console.debug(modificationFetchUrl);
    return backendFetch(modificationFetchUrl);
}

export function getLineTypesCatalog() {
    console.info(`get line types catalog`);
    const url = `${PREFIX_NETWORK_MODIFICATION_QUERIES}/v1/network-modifications/catalog/line_types`;
    return backendFetchJson(url);
}
