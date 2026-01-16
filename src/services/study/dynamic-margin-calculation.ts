/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid, PREFIX_STUDY_QUERIES } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import {
    DynamicMarginCalculationParametersFetchReturn,
    DynamicMarginCalculationParametersInfos,
} from './dynamic-margin-calculation.type';
import { fetchContingencyAndFiltersLists } from '../directory';

export function startDynamicMarginCalculation(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    debug: boolean
): Promise<Response> {
    console.info(
        `Running dynamic margin calculation on study '${studyUuid}', on root network '${currentRootNetworkUuid}'  and node '${currentNodeUuid}' ...`
    );

    const urlParams = new URLSearchParams();

    if (debug) {
        urlParams.append('debug', `${debug}`);
    }

    const startDynamicMarginCalculationUrl = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/dynamic-margin-calculation/run?${urlParams}`;

    console.debug({ startDynamicMarginCalculationUrl });

    return backendFetch(startDynamicMarginCalculationUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function stopDynamicMarginCalculation(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Stopping dynamic margin calculation  on study '${studyUuid}', on root network '${currentRootNetworkUuid}'  and node '${currentNodeUuid}' ...`
    );
    const stopDynamicMarginCalculationUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/dynamic-margin-calculation/stop';
    console.debug(stopDynamicMarginCalculationUrl);
    return backendFetch(stopDynamicMarginCalculationUrl, { method: 'put' });
}

export function fetchDynamicMarginCalculationStatus(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID
): Promise<string | null> {
    console.info(
        `Fetching dynamic margin calculation status on study '${studyUuid}', on root network '${currentRootNetworkUuid}'  and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/dynamic-margin-calculation/status';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchDynamicMarginCalculationProvider(studyUuid: UUID) {
    console.info(`Fetching dynamic margin calculation provider on study '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-margin-calculation/provider';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchDefaultDynamicMarginCalculationProvider() {
    console.info('Fetching default dynamic margin calculation provider');
    const url = PREFIX_STUDY_QUERIES + '/v1/dynamic-margin-calculation-default-provider';
    console.debug(url);
    return backendFetchText(url);
}

export function updateDynamicMarginCalculationProvider(studyUuid: UUID, newProvider: string) {
    console.info(`Updating dynamic margin calculation provider on study '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-margin-calculation/provider';
    console.debug(url);
    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: newProvider,
    });
}

export function fetchDynamicMarginCalculationParameters(
    studyUuid: UUID
): Promise<DynamicMarginCalculationParametersFetchReturn> {
    console.info(`Fetching dynamic margin calculation parameters on study '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-margin-calculation/parameters';
    console.debug(url);
    const parametersPromise: Promise<DynamicMarginCalculationParametersInfos> = backendFetchJson(url);

    // enrich LoadsVariationInfos by LoadsVariationFetchReturn with id and name infos
    return parametersPromise.then((parameters) => {
        if (parameters?.loadsVariations) {
            const loadsVariations = parameters?.loadsVariations;
            const allLoadFilterUuids = loadsVariations.flatMap((loadVariation) => loadVariation.loadFilterUuids ?? []);
            return fetchContingencyAndFiltersLists(allLoadFilterUuids).then((loadFilterInfos) => {
                delete parameters.loadsVariations;
                const loadFilterInfosMap = Object.fromEntries(
                    loadFilterInfos.map((info) => [info.elementUuid, info.elementName])
                );
                return {
                    ...parameters,
                    loadsVariationsInfos: loadsVariations?.map((infos) => {
                        const newLoadVariationInfos = {
                            ...infos,
                            loadFiltersInfos: infos.loadFilterUuids?.map((loadFilterUuid) => ({
                                id: loadFilterUuid,
                                name: loadFilterInfosMap[loadFilterUuid],
                            })),
                        };
                        delete newLoadVariationInfos.loadFilterUuids;
                        return newLoadVariationInfos;
                    }),
                };
            });
        }
        delete parameters.loadsVariations;
        return {
            ...parameters,
            loadsVariationsInfos: [],
        };
    });
}

export function updateDynamicMarginCalculationParameters(
    studyUuid: UUID,
    newParams: DynamicMarginCalculationParametersFetchReturn | null
): Promise<Response> {
    console.info(`Setting dynamic margin calculation parameters on study '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-margin-calculation/parameters';
    console.debug(url);

    // send to back raw LoadsVariations instead of LoadsVariationsInfos
    const newParameters =
        newParams != null
            ? {
                  ...newParams,
                  loadsVariations: newParams?.loadsVariationsInfos?.map((infos) => {
                      const newLoadsVariationInfos = {
                          ...infos,
                          loadFilterUuids: infos.loadFiltersInfos?.map((loadFilterInfos) => loadFilterInfos.id),
                      };
                      delete newLoadsVariationInfos.loadFiltersInfos;
                      return newLoadsVariationInfos;
                  }),
              }
            : newParams;
    delete newParameters?.loadsVariationsInfos;
    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParameters),
    });
}
