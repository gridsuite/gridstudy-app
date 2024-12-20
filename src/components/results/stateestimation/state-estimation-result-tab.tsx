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
import { FormattedMessage, useIntl } from 'react-intl/lib';
import { QualityCriterionResult, StateEstimationTabProps } from './state-estimation-result.type';
import { StateEstimationStatusResult } from './state-estimation-status-result';
import { useNodeData } from '../../study-container';
import { fetchStateEstimationResult } from '../../../services/study/state-estimation';
import RunningStatus from 'components/utils/running-status';
import { AppState } from 'redux/reducer';
import ComputingType from 'components/computing-status/computing-type';
import { useSelector } from 'react-redux';
import { StateEstimationQualityResult } from './state-estimation-quality-result';
import GlassPane from '../common/glass-pane';
import {
    stateEstimationQualityCriterionColumnsDefinition,
    stateEstimationQualityPerRegionColumnsDefinition,
} from './state-estimation-result-utils';

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
};

export const StateEstimationResultTab: FunctionComponent<StateEstimationTabProps> = ({ studyUuid, nodeUuid }) => {
    const intl = useIntl();
    const stateEstimationResultInvalidations = ['stateEstimationResult'];

    const [tabIndex, setTabIndex] = useState(0);
    const stateEstimationStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.STATE_ESTIMATION]
    );

    const fetchEstimResults = useCallback(() => {
        return fetchStateEstimationResult(studyUuid, nodeUuid);
    }, [studyUuid, nodeUuid]);

    const fetchResult = useMemo(() => {
        return fetchEstimResults;
    }, [fetchEstimResults]);

    const [stateEstimationResult, isLoadingResult] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchResult,
        stateEstimationResultInvalidations
    );

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
        if (stateEstimationStatus !== RunningStatus.SUCCEED || !stateEstimationResult) {
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

    return (
        <>
            <Box sx={styles.flexWrapper}>
                <Tabs value={tabIndex} onChange={handleTabChange} sx={styles.flexElement}>
                    <Tab label={<FormattedMessage id={'StateEstimationStatusResults'} />} />
                    <Tab label={<FormattedMessage id={'StateEstimationQualityCriterionResults'} />} />
                    <Tab label={<FormattedMessage id={'StateEstimationQualityPerRegionResults'} />} />
                </Tabs>
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
                    />
                </GlassPane>
            )}
        </>
    );
};
