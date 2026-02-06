/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '@gridsuite/commons-ui';
import { LineTypeInfo } from '../components/dialogs/line-types-catalog/line-catalog.type';

const PREFIX_NETWORK_MODIFICATION_QUERIES = import.meta.env.VITE_API_GATEWAY + '/network-modification';

export function getLineTypesCatalog(): Promise<LineTypeInfo[]> {
    console.info(`get line types catalog`);
    const url = `${PREFIX_NETWORK_MODIFICATION_QUERIES}/v1/network-modifications/catalog/line_types`;
    return backendFetchJson(url);
}

export function getLineTypeWithLimits(id: string): Promise<LineTypeInfo> {
    const url = `${PREFIX_NETWORK_MODIFICATION_QUERIES}/v1/network-modifications/catalog/line_types/${id}`;
    return backendFetchJson(url);
}
