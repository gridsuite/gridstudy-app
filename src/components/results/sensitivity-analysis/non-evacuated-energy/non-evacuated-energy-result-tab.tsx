/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, SyntheticEvent, useState } from 'react';
import { NonEvacuatedEnergyTabProps } from './non-evacuated-energy-result.type';
import { NonEvacuatedEnergyResult } from './non-evacuated-energy-result';
import { fetchNonEvacuatedEnergyResult } from '../../../../services/study/non-evacuated-energy';

import { useOpenLoaderShortWait } from '../../../dialogs/commons/handle-loader';
import { Box, LinearProgress, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { RunningStatus } from '../../../utils/running-status';
import { ComputationReportViewer } from '../../common/computation-report-viewer';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { ComputingType } from '../../../computing-status/computing-type';
import { RESULTS_LOADING_DELAY } from '../../../network/constants';
import { nonEvacuatedEnergyResultInvalidations } from '../../../computing-status/use-all-computing-status';
import { useNodeData } from 'components/use-node-data';

const styles = {
    container: {
        display: 'flex',
        position: 'relative',
    },
    tabs: {
        position: 'relative',
        top: 0,
        left: 0,
    },
    loader: {
        height: '4px',
    },
    resultContainer: {
        flexGrow: 1,
    },
};

export const NonEvacuatedEnergyResultTab: FunctionComponent<NonEvacuatedEnergyTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}) => {
    const [tabIndex, setTabIndex] = useState(0);

    const RESULTS_TAB_INDEX = 0;
    const LOGS_TAB_INDEX = 1;

    const nonEvacuatedEnergyStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]
    );

    const [nonEvacuatedEnergyResult] = useNodeData(
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        fetchNonEvacuatedEnergyResult,
        nonEvacuatedEnergyResultInvalidations
    );

    const handleTabChange = (event: SyntheticEvent, newTabIndex: number) => {
        setTabIndex(newTabIndex);
    };

    const shouldOpenLoader = useOpenLoaderShortWait({
        isLoading: nonEvacuatedEnergyStatus === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    return (
        <>
            <Box sx={styles.container}>
                <Box sx={styles.tabs}>
                    <Tabs value={tabIndex} onChange={handleTabChange}>
                        <Tab label="Results" />
                        <Tab label={<FormattedMessage id={'ComputationResultsLogs'} />} />
                    </Tabs>
                </Box>
            </Box>
            <Box sx={styles.loader}>{shouldOpenLoader && <LinearProgress />}</Box>
            <Box sx={styles.resultContainer}>
                {tabIndex === RESULTS_TAB_INDEX && (
                    <NonEvacuatedEnergyResult result={nonEvacuatedEnergyResult} status={nonEvacuatedEnergyStatus} />
                )}
                {tabIndex === LOGS_TAB_INDEX &&
                    (nonEvacuatedEnergyStatus === RunningStatus.SUCCEED ||
                        nonEvacuatedEnergyStatus === RunningStatus.FAILED) && (
                        <ComputationReportViewer reportType={ComputingType.NON_EVACUATED_ENERGY_ANALYSIS} />
                    )}
            </Box>
        </>
    );
};
