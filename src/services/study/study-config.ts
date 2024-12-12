/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl } from './index';
import { backendFetch, backendFetchJson } from '../utils';
import { UUID } from 'crypto';
import { NetworkVisualizationParameters } from '../../components/dialogs/parameters/network-visualizations/network-visualizations.types';

export function getNetworkVisualizationParameters(studyUuid: UUID) {
    console.info('get network visualization parameters');
    const url = getStudyUrl(studyUuid) + '/network-visualizations/parameters';
    console.debug(url);
    return backendFetchJson(url);
}

export function setNetworkVisualizationParameters(studyUuid: UUID, newParams: NetworkVisualizationParameters) {
    console.info('set network visualization parameters');
    const url = getStudyUrl(studyUuid) + '/network-visualizations/parameters';
    console.debug(url);
    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
    });
}
