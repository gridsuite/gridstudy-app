/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';
import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
    SensitivityAnalysisParametersInfos,
    SensitivityHVDC,
    SensitivityInjection,
    SensitivityInjectionsSet,
    SensitivityNodes,
    SensitivityPST,
} from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import {
    CsvConfig,
    SelectorFilterOptions,
    SensitivityResult,
    SensitivityResultFilterOptions,
} from './sensitivity-analysis.type';
import { FilterConfig } from '../../types/custom-aggrid-types';
import { GlobalFilters } from 'components/results/common/global-filter/global-filter-types';
import { CONTAINER_ID, CONTAINER_NAME } from '../../components/utils/field-constants';

export interface EquipmentsContainer {
    [CONTAINER_ID]: string;
    [CONTAINER_NAME]: string | null;
}

const GET_PARAMETERS_PREFIX = import.meta.env.VITE_API_GATEWAY + '/sensitivity-analysis/v1/parameters';

export function startSensitivityAnalysis(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID
): Promise<Response> {
    console.info(
        `Running sensi on ${studyUuid} for root network ${currentRootNetworkUuid} and node ${currentNodeUuid} ...`
    );
    const startSensiAnalysisUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/sensitivity-analysis/run';
    console.debug(startSensiAnalysisUrl);
    return backendFetch(startSensiAnalysisUrl, { method: 'post' });
}

export function stopSensitivityAnalysis(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Stopping sensitivity analysis on ${studyUuid} for root network ${currentRootNetworkUuid} and node ${currentNodeUuid} ...`
    );
    const stopSensitivityAnalysisUrl = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/sensitivity-analysis/stop`;
    console.debug(stopSensitivityAnalysisUrl);
    return backendFetch(stopSensitivityAnalysisUrl, { method: 'put' });
}

export function fetchSensitivityAnalysisStatus(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching sensitivity analysis status on ${studyUuid} on root network '${currentRootNetworkUuid}' and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/sensitivity-analysis/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchSensitivityAnalysisResult(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    selector: any,
    filters: FilterConfig[],
    globalFilters: GlobalFilters | undefined
): Promise<SensitivityResult | null> {
    console.info(
        `Fetching sensitivity analysis on ${studyUuid}  for root network ${currentRootNetworkUuid} and node ${currentNodeUuid}  ...`
    );
    // Add params to Url
    const urlSearchParams = new URLSearchParams();
    const jsoned = JSON.stringify(selector);
    urlSearchParams.append('selector', jsoned);

    if (filters?.length) {
        urlSearchParams.append('filters', JSON.stringify(filters));
    }
    if (globalFilters && Object.keys(globalFilters).length > 0) {
        urlSearchParams.append('globalFilters', JSON.stringify(globalFilters));
    }

    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/sensitivity-analysis/result?${urlSearchParams}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSensitivityAnalysisFilterOptions(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    selector: SelectorFilterOptions
): Promise<SensitivityResultFilterOptions | null> {
    console.info(
        `Fetching sensitivity analysis filter options on ${studyUuid} on root network ${currentRootNetworkUuid} and node ${currentNodeUuid}  ...`
    );
    // Add params to Url
    const urlSearchParams = new URLSearchParams();
    const jsoned = JSON.stringify(selector);
    urlSearchParams.append('selector', jsoned);

    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/sensitivity-analysis/result/filter-options?${urlSearchParams}`;
    console.debug(url);
    return backendFetchJson(url);
}

function getEquipmentsContainerIds(params: SensitivityAnalysisParametersInfos<UUID>): Set<string> {
    const allContainerIds = new Set<string>();

    params.sensitivityInjection?.forEach((i) => {
        i.monitoredBranches?.forEach((id) => allContainerIds.add(id));
        i.injections?.forEach((id) => allContainerIds.add(id));
        i.contingencyLists?.forEach((id) => allContainerIds.add(id));
    });

    params.sensitivityInjectionsSet?.forEach((is) => {
        is.monitoredBranches?.forEach((id) => allContainerIds.add(id));
        is.injections?.forEach((id) => allContainerIds.add(id));
        is.contingencyLists?.forEach((id) => allContainerIds.add(id));
    });

    params.sensitivityHVDC?.forEach((hvdc) => {
        hvdc.monitoredBranches?.forEach((id) => allContainerIds.add(id));
        hvdc.hvdcs?.forEach((id) => allContainerIds.add(id));
        hvdc.contingencyLists?.forEach((id) => allContainerIds.add(id));
    });

    params.sensitivityPST?.forEach((pst) => {
        pst.monitoredBranches?.forEach((id) => allContainerIds.add(id));
        pst.psts?.forEach((id) => allContainerIds.add(id));
        pst.contingencyLists?.forEach((id) => allContainerIds.add(id));
    });

    params.sensitivityNodes?.forEach((n) => {
        n.monitoredVoltageLevels?.forEach((id) => allContainerIds.add(id));
        n.equipmentsInVoltageRegulation?.forEach((id) => allContainerIds.add(id));
        n.contingencyLists?.forEach((id) => allContainerIds.add(id));
    });

    return allContainerIds;
}

function fetchElementNames(elementUuids: Set<string>) {
    console.info('fetch directory element names');

    const params = new URLSearchParams();
    elementUuids.forEach((id) => {
        params.append('ids', id);
    });

    const url = `${import.meta.env.VITE_API_GATEWAY}/explore/v1/explore/elements/name?${params.toString()}`;
    console.debug(url);

    return backendFetchJson(url);
}

export function getSensitivityAnalysisParameters(studyUuid: UUID): Promise<SensitivityAnalysisParametersInfos<UUID>> {
    console.info('get sensitivity analysis parameters');
    const url = `${getStudyUrl(studyUuid)}/sensitivity-analysis/parameters`;
    console.debug(url);
    return backendFetchJson(url);
}

export function getSensitivityAnalysisParametersEnriched(
    studyUuid: UUID
): Promise<SensitivityAnalysisParametersInfos<EquipmentsContainer>> {
    const parametersPromise: Promise<SensitivityAnalysisParametersInfos<UUID>> =
        getSensitivityAnalysisParameters(studyUuid);

    // enrich directory elements with their names
    return parametersPromise.then(
        (
            parameters: SensitivityAnalysisParametersInfos<UUID>
        ): Promise<SensitivityAnalysisParametersInfos<EquipmentsContainer>> => {
            const allElementIds = getEquipmentsContainerIds(parameters);

            return fetchElementNames(allElementIds).then((elementNames) => {
                console.log(allElementIds);
                const mapIdsToEquipmentsContainer = (ids?: UUID[]): EquipmentsContainer[] => {
                    return ids
                        ? ids.map((id) => ({
                              [CONTAINER_ID]: id,
                              [CONTAINER_NAME]: elementNames.get(id) ?? null,
                          }))
                        : [];
                };

                return {
                    ...parameters,
                    sensitivityInjectionsSet: (parameters.sensitivityInjectionsSet
                        ? parameters.sensitivityInjectionsSet.map((is) => {
                              return {
                                  ...is,
                                  monitoredBranches: mapIdsToEquipmentsContainer(is.monitoredBranches),
                                  injections: mapIdsToEquipmentsContainer(is.injections),
                                  contingencyLists: mapIdsToEquipmentsContainer(is.contingencyLists),
                              };
                          })
                        : []) as SensitivityInjectionsSet<EquipmentsContainer>[],
                    sensitivityInjection: (parameters.sensitivityInjection
                        ? parameters.sensitivityInjection.map((i) => {
                              return {
                                  ...i,
                                  monitoredBranches: mapIdsToEquipmentsContainer(i.monitoredBranches),
                                  injections: mapIdsToEquipmentsContainer(i.injections),
                                  contingencyLists: mapIdsToEquipmentsContainer(i.contingencyLists),
                              };
                          })
                        : []) as SensitivityInjection<EquipmentsContainer>[],
                    sensitivityHVDC: (parameters.sensitivityHVDC
                        ? parameters.sensitivityHVDC.map((hvdc) => {
                              return {
                                  ...hvdc,
                                  monitoredBranches: mapIdsToEquipmentsContainer(hvdc.monitoredBranches),
                                  hvdcs: mapIdsToEquipmentsContainer(hvdc.hvdcs),
                                  contingencyLists: mapIdsToEquipmentsContainer(hvdc.contingencyLists),
                              };
                          })
                        : []) as SensitivityHVDC<EquipmentsContainer>[],
                    sensitivityPST: (parameters.sensitivityPST
                        ? parameters.sensitivityPST.map((pst) => {
                              return {
                                  ...pst,
                                  monitoredBranches: mapIdsToEquipmentsContainer(pst.monitoredBranches),
                                  psts: mapIdsToEquipmentsContainer(pst.psts),
                                  contingencyLists: mapIdsToEquipmentsContainer(pst.contingencyLists),
                              };
                          })
                        : []) as SensitivityPST<EquipmentsContainer>[],
                    sensitivityNodes: (parameters.sensitivityNodes
                        ? parameters.sensitivityNodes.map((n) => {
                              return {
                                  ...n,
                                  monitoredVoltageLevels: mapIdsToEquipmentsContainer(n.monitoredVoltageLevels),
                                  equipmentsInVoltageRegulation: mapIdsToEquipmentsContainer(
                                      n.equipmentsInVoltageRegulation
                                  ),
                                  contingencyLists: mapIdsToEquipmentsContainer(n.contingencyLists),
                              };
                          })
                        : []) as SensitivityNodes<EquipmentsContainer>[],
                };
            });
        }
    );
}

export function fetchSensitivityAnalysisParameters(parameterUuid: string) {
    console.info('get sensitivity analysis parameters');
    const url = `${GET_PARAMETERS_PREFIX}/${parameterUuid}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function setSensitivityAnalysisParameters(
    studyUuid: UUID | null,
    newParams: SensitivityAnalysisParametersInfos<EquipmentsContainer> | null
) {
    console.info('set sensitivity analysis parameters');
    const url = getStudyUrl(studyUuid) + '/sensitivity-analysis/parameters';
    console.debug(url);
    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: newParams ? JSON.stringify(newParams) : null,
    });
}

export function exportSensitivityResultsAsCsv(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    csvConfig: CsvConfig,
    selector: any,
    filters: FilterConfig[],
    globalFilters: GlobalFilters | undefined
) {
    console.info(
        `Exporting sensitivity analysis on ${studyUuid} on root network ${currentRootNetworkUuid} and node ${currentNodeUuid} as CSV ...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('selector', JSON.stringify(selector));
    if (filters?.length) {
        urlSearchParams.append('filters', JSON.stringify(filters));
    }
    if (globalFilters && Object.keys(globalFilters).length > 0) {
        urlSearchParams.append('globalFilters', JSON.stringify(globalFilters));
    }
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/sensitivity-analysis/result/csv?${urlSearchParams}`;
    console.debug(url);
    return backendFetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(csvConfig),
    });
}
