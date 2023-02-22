/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useNodeData } from '../../study-container';
import {
    fetchDynamicSimulationResult,
    fetchDynamicSimulationResultTimeSeries,
} from '../../../utils/rest-api';
import WaitingLoader from '../../util/waiting-loader';
import DynamicSimulationResult from './dynamic-simulation-result';
import { useCallback } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';

const dynamicSimulationResultInvalidations = ['dynamicSimulationResult'];
const loadingMessage = 'LoadingRemoteData';

const DynamicSimulationResultTab = ({ studyUuid, nodeUuid }) => {
    const [dynamicSimulationResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchDynamicSimulationResult,
        dynamicSimulationResultInvalidations,
        null,
        (res) => ({
            status: res.status,
            timeseries: Array(res.timeseriesMetadata.metadatas.length),
            seriesNames: res.timeseriesMetadata.metadatas.map(
                (elem) => elem.name
            ),
        })
    );

    const { snackError } = useSnackMessage();

    const loadTimeSeries = useCallback(
        (selectedIndexes) => {
            // check cache to get not yet loaded selected indexes
            const selectedIndexesToLoad = selectedIndexes.filter(
                (indexValue) => !dynamicSimulationResult.timeseries[indexValue]
            );

            // LOAD ON DEMAND
            if (selectedIndexesToLoad.length === 0) {
                // do not need load, return direct selected series in cache
                return Promise.resolve(
                    selectedIndexes.map(
                        (indexValue) =>
                            dynamicSimulationResult.timeseries[indexValue]
                    )
                );
            } else {
                // need load selected series not yet in cache

                const timeSeriesNamesToLoad = selectedIndexesToLoad.map(
                    (indexValue) =>
                        dynamicSimulationResult.seriesNames[indexValue]
                );

                return fetchDynamicSimulationResultTimeSeries(
                    studyUuid,
                    nodeUuid,
                    timeSeriesNamesToLoad
                )
                    .then((newlyLoadedTimeSeries) => {
                        // insert one by one newly loaded timeserie into the cache
                        for (const newSeries of newlyLoadedTimeSeries) {
                            dynamicSimulationResult.timeseries.splice(
                                dynamicSimulationResult.seriesNames.indexOf(
                                    newSeries.metadata.name
                                ),
                                1,
                                newSeries
                            );
                        }

                        // return selected series in newly updated cache
                        return selectedIndexes.map(
                            (indexValue) =>
                                dynamicSimulationResult.timeseries[indexValue]
                        );
                    })
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'DynamicSimulationResults',
                        });
                    });
            }
        },
        [studyUuid, nodeUuid, dynamicSimulationResult, snackError]
    );

    return (
        <WaitingLoader message={loadingMessage} loading={isWaiting}>
            <DynamicSimulationResult
                result={dynamicSimulationResult}
                loadTimeSeries={loadTimeSeries}
            />
        </WaitingLoader>
    );
};

export default DynamicSimulationResultTab;
