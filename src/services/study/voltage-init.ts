/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';
import { UUID } from 'crypto';
import { VoltageInitStudyParameters } from '@gridsuite/commons-ui';
import { type ResultsQueryParams } from '../../components/results/common/types';

export function startVoltageInit(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    debug: boolean
): Promise<void> {
    console.info(
        `Running voltage init on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );

    const urlParams = new URLSearchParams();
    if (debug) {
        urlParams.append('debug', `${debug}`);
    }

    const startVoltageInitUrl = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid)}/voltage-init/run?${urlParams}`;
    console.debug(startVoltageInitUrl);
    return backendFetch(startVoltageInitUrl, { method: 'put' });
}

export function stopVoltageInit(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Stopping voltage init on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopVoltageInitUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/voltage-init/stop';
    console.debug(stopVoltageInitUrl);
    return backendFetch(stopVoltageInitUrl, { method: 'put' });
}

export function fetchVoltageInitStatus(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching voltage init status on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/voltage-init/status';

    console.debug(url);
    return backendFetchText(url);
}

export function fetchVoltageInitResult(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    queryParams: ResultsQueryParams
) {
    console.info(
        `Fetching voltage init result on '${studyUuid}' , node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}' ...`
    );
    const { globalFilters } = queryParams || {};
    const params = new URLSearchParams({});

    if (globalFilters && Object.keys(globalFilters).length > 0) {
        params.append('globalFilters', JSON.stringify(globalFilters));
    }

    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/voltage-init/result';
    const urlWithParams = `${url}?${params.toString()}`;

    console.debug(urlWithParams);
    return backendFetchJson(urlWithParams);
}

export function getVoltageInitStudyParameters(studyUuid: UUID): Promise<VoltageInitStudyParameters> {
    console.info('get voltage init study parameters');
    const getVoltageInitParams = getStudyUrl(studyUuid) + '/voltage-init/parameters';
    console.debug(getVoltageInitParams);
    return backendFetchJson(getVoltageInitParams);
}

export function getVoltageInitModifications(studyUuid: UUID, currentNodeId: UUID, currentRootNetworkUuid: UUID) {
    console.info('get voltage init modifications');
    const getVoltageInitModifications =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeId, currentRootNetworkUuid) +
        '/network-modifications/voltage-init';
    console.debug(getVoltageInitModifications);
    return backendFetchJson(getVoltageInitModifications);
}

export function cloneVoltageInitModifications(studyUuid: UUID, currentNodeId: UUID, currentRootNetworkUuid: UUID) {
    console.info('cloning voltage init modifications');
    const cloneVoltageInitModificationsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeId, currentRootNetworkUuid) +
        '/network-modifications/voltage-init';

    return backendFetch(cloneVoltageInitModificationsUrl, {
        method: 'POST',
    });
}
