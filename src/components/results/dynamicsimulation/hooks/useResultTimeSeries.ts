/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { fetchDynamicSimulationResultTimeSeries } from '../../../../services/study/dynamic-simulation';

import { useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { UUID } from 'crypto';
import { TimeSeriesMetadata } from '../types/dynamic-simulation-result.type';
import { fetchDynamicSimulationTimeSeriesMetadata } from '../../../../services/dynamic-simulation';
import { dynamicSimulationResultInvalidations } from '../../../computing-status/use-all-computing-status';
import { useNodeData } from 'components/use-node-data';

const useResultTimeSeries = (nodeUuid: UUID, studyUuid: UUID, currentRootNetworkUuid: UUID) => {
    const [result, isLoading] = useNodeData(
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        fetchDynamicSimulationTimeSeriesMetadata,
        dynamicSimulationResultInvalidations,
        null,
        (timeseriesMetadatas: TimeSeriesMetadata[] | null) => ({
            timeseries: timeseriesMetadatas ? Array(timeseriesMetadatas.length) : undefined,
            timeseriesMetadatas: timeseriesMetadatas,
        })
    );

    const { snackError } = useSnackMessage();

    const lazyLoadTimeSeriesCb = useCallback(
        (selectedIndexes: number[]) => {
            // check cache to get not yet loaded selected indexes
            const selectedIndexesToLoad = selectedIndexes.filter((indexValue) => !result.timeseries[indexValue]);

            // LOAD ON DEMAND
            if (selectedIndexesToLoad.length === 0) {
                // do not need load, return direct selected series in cache
                return Promise.resolve(
                    selectedIndexes.map((indexValue) => ({
                        ...result.timeseries[indexValue],
                        index: indexValue, // memorize index position in the series names list to generate a color later in plot
                    }))
                );
            } else {
                // need load selected series not yet in cache

                const timeSeriesNamesToLoad = selectedIndexesToLoad.map(
                    (indexValue) => result.timeseriesMetadatas[indexValue].name
                );

                return fetchDynamicSimulationResultTimeSeries(
                    studyUuid,
                    nodeUuid,
                    currentRootNetworkUuid,
                    timeSeriesNamesToLoad
                )
                    .then((newlyLoadedTimeSeries) => {
                        // insert one by one newly loaded timeserie into the cache
                        for (const newSeries of newlyLoadedTimeSeries) {
                            result.timeseries.splice(
                                result.timeseriesMetadatas.findIndex(
                                    (elem: TimeSeriesMetadata) => elem.name === newSeries.metadata.name
                                ),
                                1,
                                newSeries
                            );
                        }

                        // return selected series in newly updated cache
                        return selectedIndexes.map((indexValue) => ({
                            ...result.timeseries[indexValue],
                            index: indexValue, // memorize index position in the series names list to generate a color later in plot
                        }));
                    })
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'DynamicSimulationResults',
                        });
                    });
            }
        },
        [studyUuid, nodeUuid, currentRootNetworkUuid, result, snackError]
    );

    return [result, lazyLoadTimeSeriesCb, isLoading];
};

export default useResultTimeSeries;
