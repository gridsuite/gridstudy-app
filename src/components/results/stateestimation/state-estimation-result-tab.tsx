/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, SyntheticEvent, useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { FormattedMessage, useIntl } from 'react-intl/lib';
import { StateEstimationTabProps } from './state-estimation-result.type';
import { StateEstimationStatusResult } from './state-estimation-status-result';
import { fetchStateEstimationResult } from '../../../services/study/state-estimation';
import { AppState } from 'redux/reducer.type';
import { ComputingType, TableType, type MuiStyles, RunningStatus } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import StateEstimationResult from './state-estimation-result';
import GlassPane from '../common/glass-pane';
import { useComputationColumnFilters } from '../common/column-filter/use-computation-column-filters';
import {
    mapMeasurementResults,
    mapQualityCriterionResults,
    MEASUREMENT_RESULTS_TABLE,
    QUALITY_CRITERION_RESULTS_TABLE,
    QUALITY_PER_REGION_RESULTS_TABLE,
    stateEstimationMeasurementColumnsDefinition,
    stateEstimationQualityCriterionColumnsDefinition,
    stateEstimationQualityPerRegionColumnsDefinition,
} from './state-estimation-result-utils';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { stateEstimationResultInvalidations } from '../../computing-status/use-all-computing-status';
import { useNodeData } from 'components/use-node-data';

const styles = {
    flexWrapper: {
        display: 'flex',
    },
    flexElement: {
        flexGrow: 0,
    },
    show: {
        display: 'inherit',
    },
    hide: {
        display: 'none',
    },
    emptySpace: {
        flexGrow: 1,
    },
} as const satisfies MuiStyles;

export const StateEstimationResultTab: FunctionComponent<StateEstimationTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}) => {
    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(0);
    const stateEstimationStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.STATE_ESTIMATION]
    );

    const { result: stateEstimationResult, isLoading: isLoadingResult } = useNodeData({
        studyUuid,
        nodeUuid,
        rootNetworkUuid: currentRootNetworkUuid,
        fetcher: fetchStateEstimationResult,
        invalidations: stateEstimationResultInvalidations,
    });

    useComputationColumnFilters(TableType.StateEstimation, MEASUREMENT_RESULTS_TABLE);

    const stateEstimationResultColumns = useMemo(() => {
        switch (tabIndex) {
            case 1:
                return stateEstimationMeasurementColumnsDefinition(intl);
            case 2:
                return stateEstimationQualityCriterionColumnsDefinition(intl);
            case 3:
                return stateEstimationQualityPerRegionColumnsDefinition(intl);

            default:
                return [];
        }
    }, [intl, tabIndex]);

    const handleTabChange = (_event: SyntheticEvent, newTabIndex: number) => {
        setTabIndex(newTabIndex);
    };

    const result = useMemo(() => {
        const isProcessing =
            stateEstimationStatus !== RunningStatus.SUCCEED && stateEstimationStatus !== RunningStatus.FAILED;
        if (isProcessing || !stateEstimationResult) {
            return {};
        }
        return {
            ...stateEstimationResult,
            measurementInformationResults: mapMeasurementResults(
                stateEstimationResult.measurementInformationResults ?? []
            ),
            qualityCriterionResults: mapQualityCriterionResults(
                stateEstimationResult.qualityCriterionResults ?? [],
                intl
            ),
        };
    }, [stateEstimationStatus, stateEstimationResult, intl]);

    const renderReportViewer = () => {
        return (
            <GlassPane active={isLoadingResult}>
                {(stateEstimationStatus === RunningStatus.SUCCEED ||
                    stateEstimationStatus === RunningStatus.FAILED) && (
                    <ComputationReportViewer reportType={ComputingType.STATE_ESTIMATION} />
                )}
            </GlassPane>
        );
    };

    return (
        <>
            <Box sx={styles.flexWrapper}>
                <Tabs value={tabIndex} onChange={handleTabChange} sx={styles.flexElement}>
                    <Tab label={<FormattedMessage id={'StateEstimationStatusResults'} />} />
                    <Tab label={<FormattedMessage id={'StateEstimationMeasurementResults'} />} />
                    <Tab label={<FormattedMessage id={'StateEstimationQualityCriterionResults'} />} />
                    <Tab label={<FormattedMessage id={'StateEstimationQualityPerRegionResults'} />} />
                    <Tab label={<FormattedMessage id={'ComputationResultsLogs'} />} />
                </Tabs>
                <Box sx={styles.emptySpace}></Box>
            </Box>

            {tabIndex === 0 && <StateEstimationStatusResult result={result} />}
            {tabIndex === 1 && (
                <GlassPane active={isLoadingResult}>
                    <StateEstimationResult
                        result={result}
                        isLoadingResult={isLoadingResult}
                        columnDefs={stateEstimationResultColumns}
                        tableName={MEASUREMENT_RESULTS_TABLE}
                        exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
                        filter={true}
                        sortable={true}
                    />
                </GlassPane>
            )}
            {tabIndex === 2 && (
                <GlassPane active={isLoadingResult}>
                    <StateEstimationResult
                        result={result}
                        isLoadingResult={isLoadingResult}
                        columnDefs={stateEstimationResultColumns}
                        tableName={QUALITY_CRITERION_RESULTS_TABLE}
                        exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
                    />
                </GlassPane>
            )}
            {tabIndex === 3 && (
                <GlassPane active={isLoadingResult}>
                    <StateEstimationResult
                        result={result}
                        isLoadingResult={isLoadingResult}
                        columnDefs={stateEstimationResultColumns}
                        tableName={QUALITY_PER_REGION_RESULTS_TABLE}
                        exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
                    />
                </GlassPane>
            )}
            {tabIndex === 4 && renderReportViewer()}
        </>
    );
};
