/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid, PREFIX_STUDY_QUERIES } from '.';
import { backendFetch, backendFetchJson, ComputingType } from '@gridsuite/commons-ui';
import RunningStatus, {
    getDynamicMarginCalculationRunningStatus,
    getDynamicSecurityAnalysisRunningStatus,
    getDynamicSimulationRunningStatus,
    getLoadFlowRunningStatus,
    getPccMinRunningStatus,
    getSecurityAnalysisRunningStatus,
    getSensitivityAnalysisRunningStatus,
    getShortCircuitAnalysisRunningStatus,
    getStateEstimationRunningStatus,
    getVoltageInitRunningStatus,
} from '../../components/utils/running-status';
import { fetchLoadFlowComputationInfos } from './loadflow';

interface BasicStudyInfos {
    uniqueId: string;
    id: UUID;
    userId: string;
    monoRoot: boolean;
}

export const fetchStudyExists = (studyUuid: UUID) => {
    console.info(`Fetching study '${studyUuid}' existence ...`);
    const fetchStudiesUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl, { method: 'head' });
};

export const fetchStudy = (studyUuid: UUID): Promise<BasicStudyInfos> => {
    console.info(`Fetching study '${studyUuid}' ...`);
    const fetchStudyUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudyUrl);
    return backendFetchJson(fetchStudyUrl);
};

export const recreateStudyNetworkFromExistingCase = (
    caseUuid: UUID,
    studyUuid: UUID,
    currentRootNetworkUuid: UUID,
    importParameters: Record<string, any>
): Promise<Response> => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('caseUuid', caseUuid);

    const recreateStudyNetworkUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/root-networks/' +
        encodeURIComponent(currentRootNetworkUuid) +
        '/network?' +
        urlSearchParams.toString();

    console.debug(recreateStudyNetworkUrl);

    return backendFetch(recreateStudyNetworkUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importParameters),
    });
};

export const recreateStudyNetwork = (studyUuid: UUID, currentRootNetworkUuid: UUID): Promise<Response> => {
    const recreateStudyNetworkUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/root-networks/' +
        encodeURIComponent(currentRootNetworkUuid) +
        '/network';

    console.debug(recreateStudyNetworkUrl);

    return backendFetch(recreateStudyNetworkUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
    });
};

export const reindexAllRootNetwork = (studyUuid: UUID, currentRootNetworkUuid: UUID): Promise<Response> => {
    const reindexAllRootNetworkUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/root-networks/' +
        encodeURIComponent(currentRootNetworkUuid) +
        '/reindex-all';

    console.debug(reindexAllRootNetworkUrl);

    return backendFetch(reindexAllRootNetworkUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
    });
};

export function unbuildAllStudyNodes(studyUuid: UUID) {
    console.info('Unbuild all nodes in study ' + studyUuid + ' ...');
    const url = getStudyUrl(studyUuid) + '/nodes/unbuild-all';
    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function getComputingStatusParametersFetcher(
    computingType: ComputingType
): ((studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => Promise<string | null>) | undefined {
    if (computingType === ComputingType.LOAD_FLOW) {
        return fetchLoadFlowComputationInfos;
    } else {
        return undefined;
    }
}

export function getRunningStatusByComputingType(
    statusValue: string,
    computingType: ComputingType
): RunningStatus {
    switch (computingType) {
        case ComputingType.PCC_MIN:
            return getPccMinRunningStatus(statusValue);
        case ComputingType.LOAD_FLOW:
            return getLoadFlowRunningStatus(statusValue);
        case ComputingType.SECURITY_ANALYSIS:
            return getSecurityAnalysisRunningStatus(statusValue);
        case ComputingType.SENSITIVITY_ANALYSIS:
            return getSensitivityAnalysisRunningStatus(statusValue);
        case ComputingType.SHORT_CIRCUIT:
            return getShortCircuitAnalysisRunningStatus(statusValue);
        case ComputingType.SHORT_CIRCUIT_ONE_BUS:
            return getShortCircuitAnalysisRunningStatus(statusValue);
        case ComputingType.DYNAMIC_SIMULATION:
            return getDynamicSimulationRunningStatus(statusValue);
        case ComputingType.DYNAMIC_SECURITY_ANALYSIS:
            return getDynamicSecurityAnalysisRunningStatus(statusValue);
        case ComputingType.DYNAMIC_MARGIN_CALCULATION:
            return getDynamicMarginCalculationRunningStatus(statusValue);
        case ComputingType.VOLTAGE_INITIALIZATION:
            return getVoltageInitRunningStatus(statusValue);
        case ComputingType.STATE_ESTIMATION:
            return getStateEstimationRunningStatus(statusValue);
        default:
            return RunningStatus.IDLE;
    }
}

export function fetchAllComputationStatus(
    studyUuid: UUID,
    nodeUuid: UUID,
    currentRootNetworkUuid: UUID
): Promise<Map<ComputingType, string>> {
    console.info(
        `Fetching all computation status on study '${studyUuid}', on root network '${currentRootNetworkUuid}' and node '${nodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid, currentRootNetworkUuid) + '/computations/status';
    return backendFetchJson(url);
}
