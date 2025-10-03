/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    fetchDynamicSimulationResultTimeSeries,
    fetchDynamicSimulationTimeSeriesMetadata,
} from '../../../../services/study/dynamic-simulation';

import { useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import type { UUID } from 'node:crypto';
import { SimpleTimeSeriesMetadata, Timeseries } from '../types/dynamic-simulation-result.type';
import { dynamicSimulationResultInvalidations } from '../../../computing-status/use-all-computing-status';
import { useNodeData } from 'components/use-node-data';

const useResultTimeSeries = ({
    nodeUuid,
    studyUuid,
    rootNetworkUuid,
}: {
    nodeUuid: UUID;
    studyUuid: UUID;
    rootNetworkUuid: UUID;
}) => {
    const { result, isLoading } = useNodeData<
        SimpleTimeSeriesMetadata[],
        {
            timeseries: Timeseries[] | undefined;
            timeseriesMetadatas: SimpleTimeSeriesMetadata[] | undefined;
        }
    >({
        studyUuid,
        nodeUuid,
        rootNetworkUuid,
        fetcher: fetchDynamicSimulationTimeSeriesMetadata,
        invalidations: dynamicSimulationResultInvalidations,
        resultConverter: (timeseriesMetadatas: SimpleTimeSeriesMetadata[] | null) => ({
            timeseries: timeseriesMetadatas ? Array(timeseriesMetadatas.length) : undefined,
            timeseriesMetadatas: timeseriesMetadatas ?? undefined,
        }),
    });

    const { snackError } = useSnackMessage();

    const lazyLoadTimeSeriesCb = useCallback(
        (selectedIndexes: number[]) => {
            const undefinedPromise = Promise.resolve(undefined);
            // cache not yet created
            if (result === null || typeof result !== 'object') {
                return undefinedPromise;
            }

            const { timeseries, timeseriesMetadatas } = result;

            // no timeseries
            if (typeof timeseries !== 'object') {
                return undefinedPromise;
            }
            // no metadata
            if (typeof timeseriesMetadatas !== 'object') {
                return undefinedPromise;
            }

            // check cache to get not yet loaded selected indexes
            const selectedIndexesToLoad = selectedIndexes.filter((indexValue) => !timeseries[indexValue]);

            // LOAD ON DEMAND
            if (selectedIndexesToLoad.length === 0) {
                // do not need load, return direct selected series in cache
                return Promise.resolve(
                    selectedIndexes.map((indexValue) => ({
                        ...timeseries[indexValue],
                        index: indexValue, // memorize index position in the series names list to generate a color later in plot
                    }))
                );
            } else {
                // need load selected series not yet in cache

                const timeSeriesNamesToLoad = selectedIndexesToLoad.map(
                    (indexValue) => timeseriesMetadatas[indexValue].name
                );

                return fetchDynamicSimulationResultTimeSeries(
                    studyUuid,
                    nodeUuid,
                    rootNetworkUuid,
                    timeSeriesNamesToLoad
                )
                    .then((newlyLoadedTimeSeries) => {
                        // insert one by one newly loaded timeserie into the cache
                        for (const newSeries of newlyLoadedTimeSeries) {
                            timeseries.splice(
                                timeseriesMetadatas.findIndex(
                                    (elem: SimpleTimeSeriesMetadata) => elem.name === newSeries.metadata.name
                                ),
                                1,
                                newSeries
                            );
                        }

                        // return selected series in newly updated cache
                        return selectedIndexes.map((indexValue) => ({
                            ...timeseries[indexValue],
                            index: indexValue, // memorize index position in the series names list to generate a color later in plot
                        }));
                    })
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'DynamicSimulationResults',
                        });
                        return undefined;
                    });
            }
        },
        [studyUuid, nodeUuid, rootNetworkUuid, result, snackError]
    );

    return {
        result,
        lazyLoadTimeSeriesCb,
        isLoading,
    };
};

export default useResultTimeSeries;
