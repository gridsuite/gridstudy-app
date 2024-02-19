/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNodeData } from '../../study-container';
import React, { useCallback, useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    fetchDynamicSimulationResult,
    fetchDynamicSimulationResultTimeSeries,
} from '../../../services/study/dynamic-simulation';
import { useSelector } from 'react-redux';
import ComputingType from '../../computing-status/computing-type';
import { Box, Tab, Tabs } from '@mui/material';
import { useIntl } from 'react-intl';
import RunningStatus from '../../utils/running-status';
import TabPanelLazy from '../common/tab-panel-lazy';
import DynamicSimulationResultTimeSeries from './dynamic-simulation-result-time-series';
import DynamicSimulationResultTable from './dynamic-simulation-result-table';
import WaitingLoader from '../../utils/waiting-loader';

const TAB_INDEX_TIME_SERIES = 'DynamicSimulationTabTimeSeries';
const TAB_INDEX_STATUS = 'DynamicSimulationTabStatus';

const dynamicSimulationResultInvalidations = ['dynamicSimulationResult'];
const loadingMessage = 'LoadingRemoteData';

const DynamicSimulationResultTab = ({ studyUuid, nodeUuid }) => {
    const [dynamicSimulationResult, isLoadingResult] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchDynamicSimulationResult,
        dynamicSimulationResultInvalidations,
        null,
        (res) => ({
            status: res.status,
            timeseries: res.timeseriesMetadatas
                ? Array(res.timeseriesMetadatas.length)
                : undefined,
            timeseriesMetadatas: res.timeseriesMetadatas,
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
                    selectedIndexes.map((indexValue) => ({
                        ...dynamicSimulationResult.timeseries[indexValue],
                        index: indexValue, // memorize index position in the series names list to generate a color later in plot
                    }))
                );
            } else {
                // need load selected series not yet in cache

                const timeSeriesNamesToLoad = selectedIndexesToLoad.map(
                    (indexValue) =>
                        dynamicSimulationResult.timeseriesMetadatas[indexValue]
                            .name
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
                                dynamicSimulationResult.timeseriesMetadatas.findIndex(
                                    (elem) =>
                                        elem.name === newSeries.metadata.name
                                ),
                                1,
                                newSeries
                            );
                        }

                        // return selected series in newly updated cache
                        return selectedIndexes.map((indexValue) => ({
                            ...dynamicSimulationResult.timeseries[indexValue],
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
        [studyUuid, nodeUuid, dynamicSimulationResult, snackError]
    );

    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(TAB_INDEX_TIME_SERIES);

    const dynamicSimulationStatus = useSelector(
        (state) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );

    const dynamicSimulationResultPresent =
        dynamicSimulationStatus === RunningStatus.SUCCEED ||
        dynamicSimulationStatus === RunningStatus.FAILED;
    const handleTabChange = (_, newTabIndex) => {
        setTabIndex(newTabIndex);
    };

    return (
        <>
            <Box>
                <Tabs value={tabIndex} onChange={handleTabChange}>
                    <Tab
                        label={intl.formatMessage({
                            id: TAB_INDEX_TIME_SERIES,
                        })}
                        value={TAB_INDEX_TIME_SERIES}
                    />
                    <Tab
                        label={intl.formatMessage({
                            id: TAB_INDEX_STATUS,
                        })}
                        value={TAB_INDEX_STATUS}
                    />
                </Tabs>
            </Box>
            <WaitingLoader message={loadingMessage} loading={isLoadingResult}>
                <Box>
                    <TabPanelLazy
                        key={TAB_INDEX_TIME_SERIES}
                        selected={tabIndex === TAB_INDEX_TIME_SERIES}
                    >
                        {dynamicSimulationResult &&
                            dynamicSimulationResultPresent && (
                                <DynamicSimulationResultTimeSeries
                                    result={{
                                        timeseriesMetadatas:
                                            dynamicSimulationResult.timeseriesMetadatas,
                                    }}
                                    loadTimeSeries={loadTimeSeries}
                                />
                            )}
                    </TabPanelLazy>
                    <TabPanelLazy
                        key={TAB_INDEX_STATUS}
                        selected={tabIndex === TAB_INDEX_STATUS}
                    >
                        {dynamicSimulationResult &&
                            dynamicSimulationResultPresent && (
                                <DynamicSimulationResultTable
                                    result={[
                                        {
                                            status: dynamicSimulationResult.status,
                                        },
                                    ]}
                                />
                            )}
                    </TabPanelLazy>
                </Box>
            </WaitingLoader>
        </>
    );
};

export default DynamicSimulationResultTab;
