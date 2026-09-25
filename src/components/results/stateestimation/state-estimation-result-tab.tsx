/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { FormattedMessage, useIntl } from 'react-intl/lib';
import { QualityCriterionResult, StateEstimationTabProps } from './state-estimation-result.type';
import { StateEstimationStatusResult } from './state-estimation-status-result';
import { computeLogicalControls, fetchStateEstimationResult } from '../../../services/study/state-estimation';
import { LogicalControlsResultDto } from './logicalcontrols/logicalControls.types';
import { AppState } from 'redux/reducer.type';
import {
    ComputingType,
    RunningStatus,
    type MuiStyles,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { StateEstimationQualityResult } from './state-estimation-quality-result';
import GlassPane from '../common/glass-pane';
import {
    stateEstimationQualityCriterionColumnsDefinition,
    stateEstimationQualityPerRegionColumnsDefinition,
} from './state-estimation-result-utils';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { stateEstimationResultInvalidations } from '../../computing-status/use-all-computing-status';
import { useNodeData } from 'components/use-node-data';
import { LogicalControlsResult } from './logicalcontrols/logical-controls-result';

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
    computeLogicalControlsButton: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(2),
    }),
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
    const { snackError } = useSnackMessage();

    const [isRunningLogicalControls, setIsRunningLogicalControls] = useState(false);
    const [logicalControlsResult, setLogicalControlsResult] = useState<LogicalControlsResultDto>();

    const { result: stateEstimationResult, isLoading: isLoadingResult } = useNodeData({
        studyUuid,
        nodeUuid,
        rootNetworkUuid: currentRootNetworkUuid,
        fetcher: fetchStateEstimationResult,
        invalidations: stateEstimationResultInvalidations,
    });

    const stateEstimationQualityColumns = useMemo(() => {
        switch (tabIndex) {
            case 1:
                return stateEstimationQualityCriterionColumnsDefinition(intl);
            case 2:
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
            qualityCriterionResults: stateEstimationResult.qualityCriterionResults.map(
                (qCrit: QualityCriterionResult) => {
                    return {
                        type: intl.formatMessage({ id: qCrit.type }),
                        validity: qCrit.validity,
                        value: qCrit.value,
                        threshold: qCrit.threshold,
                    };
                }
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

    const runLogicalControls = useCallback(() => {
        if (studyUuid && nodeUuid && currentRootNetworkUuid) {
            setIsRunningLogicalControls(true);
            setLogicalControlsResult(undefined);
            computeLogicalControls(studyUuid, nodeUuid, currentRootNetworkUuid)
                .then((results) => {
                    setLogicalControlsResult(results);
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'LogicalControlsComputationErrorMsg' });
                })
                .finally(() => {
                    setIsRunningLogicalControls(false);
                });
        }
    }, [nodeUuid, currentRootNetworkUuid, snackError, studyUuid]);

    return (
        <>
            <Box sx={styles.flexWrapper}>
                <Tabs value={tabIndex} onChange={handleTabChange} sx={styles.flexElement}>
                    <Tab label={<FormattedMessage id={'StateEstimationStatusResults'} />} />
                    <Tab label={<FormattedMessage id={'StateEstimationQualityCriterionResults'} />} />
                    <Tab label={<FormattedMessage id={'StateEstimationQualityPerRegionResults'} />} />
                    <Tab label={<FormattedMessage id={'StateEstimationLogicalControlsResults'} />} />
                    <Tab label={<FormattedMessage id={'ComputationResultsLogs'} />} />
                </Tabs>
                {tabIndex === 3 && (
                    <Box sx={styles.computeLogicalControlsButton}>
                        <Button variant="outlined" onClick={runLogicalControls} disabled={isRunningLogicalControls}>
                            <FormattedMessage id="StateEstimationRunLogicalControls" />
                        </Button>
                    </Box>
                )}
                <Box sx={styles.emptySpace}></Box>
            </Box>

            {tabIndex === 0 && <StateEstimationStatusResult result={result} />}
            {tabIndex === 1 && (
                <GlassPane active={isLoadingResult}>
                    <StateEstimationQualityResult
                        result={result}
                        isLoadingResult={isLoadingResult}
                        columnDefs={stateEstimationQualityColumns}
                        tableName="qualityCriterionResults"
                        exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
                    />
                </GlassPane>
            )}
            {tabIndex === 2 && (
                <GlassPane active={isLoadingResult}>
                    <StateEstimationQualityResult
                        result={result}
                        isLoadingResult={isLoadingResult}
                        columnDefs={stateEstimationQualityColumns}
                        tableName="qualityPerRegionResults"
                        exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
                    />
                </GlassPane>
            )}
            {tabIndex === 3 && (
                <LogicalControlsResult
                    result={logicalControlsResult}
                    isLoadingResult={isRunningLogicalControls}
                    exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
                />
            )}
            {tabIndex === 4 && renderReportViewer()}
        </>
    );
};
