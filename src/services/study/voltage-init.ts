/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuid } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';
import { UUID } from 'crypto';
import { VoltageInitParam } from '../../components/dialogs/parameters/voltageinit/voltage-init-utils';

export function startVoltageInit(studyUuid: UUID, currentNodeUuid: UUID) {
    console.info(`Running voltage init on '${studyUuid}' and node '${currentNodeUuid}' ...`);

    const startVoltageInitUrl = getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/voltage-init/run';
    console.debug(startVoltageInitUrl);
    return backendFetch(startVoltageInitUrl, { method: 'put' });
}

export function stopVoltageInit(studyUuid: UUID, currentNodeUuid: UUID) {
    console.info(`Stopping voltage init on '${studyUuid}' and node '${currentNodeUuid}' ...`);
    const stopVoltageInitUrl = getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/voltage-init/stop';
    console.debug(stopVoltageInitUrl);
    return backendFetch(stopVoltageInitUrl, { method: 'put' });
}

export function fetchVoltageInitStatus(studyUuid: UUID, currentNodeUuid: UUID) {
    console.info(`Fetching voltage init status on '${studyUuid}' and node '${currentNodeUuid}' ...`);
    const url = getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/voltage-init/status';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchVoltageInitResult(studyUuid: UUID, currentNodeUuid: UUID) {
    console.info(`Fetching voltage init result on '${studyUuid}' and node '${currentNodeUuid}' ...`);
    const url = getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/voltage-init/result';
    console.debug(url);
    return backendFetchJson(url);
}

export function updateVoltageInitParameters(
    studyUuid: UUID | null,
    newParams: VoltageInitParam | Record<string, boolean | null>
) {
    console.info('set voltage init parameters');
    const url = getStudyUrl(studyUuid) + '/voltage-init/parameters';
    console.debug(url);

    console.info('newParams in rest API', newParams);

    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
    });
}

export function getVoltageInitStudyParameters(studyUuid: UUID) {
    console.info('get voltage init study parameters');
    const getVoltageInitParams = getStudyUrl(studyUuid) + '/voltage-init/parameters';
    console.debug(getVoltageInitParams);
    return backendFetchJson(getVoltageInitParams);
}

export function getVoltageInitModifications(studyUuid: UUID, currentNodeId: UUID) {
    console.info('get voltage init modifications');
    const getVoltageInitModifications =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeId) + '/voltage-init/modifications';
    console.debug(getVoltageInitModifications);
    return backendFetchJson(getVoltageInitModifications);
}

export function cloneVoltageInitModifications(studyUuid: UUID, currentNodeId: UUID) {
    console.info('cloning voltage init modifications');
    const cloneVoltageInitModificationsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeId) + '/voltage-init/modifications';

    return backendFetch(cloneVoltageInitModificationsUrl, {
        method: 'PUT',
    });
}
