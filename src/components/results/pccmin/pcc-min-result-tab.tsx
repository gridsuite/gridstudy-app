/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, SyntheticEvent, useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { FormattedMessage, useIntl } from 'react-intl/lib';
import RunningStatus from 'components/utils/running-status';
import { AppState } from 'redux/reducer';
import { ComputingType, type MuiStyles } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import GlassPane from '../common/glass-pane';

import { ComputationReportViewer } from '../common/computation-report-viewer';
import { useNodeData } from 'components/use-node-data';
import { PccMinTabProps } from './pcc-min-result.type';
import { fetchPccMinResult } from 'services/study/pcc-min';
import { pccMinResultInvalidations } from 'components/computing-status/use-all-computing-status';
import { pccMinResultColumnsDefinition } from './pcc-min-result-utils';
import { PccMinResults } from './pcc-min-results';

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

export const PccMinResultTab: FunctionComponent<PccMinTabProps> = ({ studyUuid, nodeUuid, currentRootNetworkUuid }) => {
    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(0);
    const PccMinStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.PCC_MIN]);

    const { result: PccMinResult, isLoading: isLoadingResult } = useNodeData({
        studyUuid,
        nodeUuid,
        rootNetworkUuid: currentRootNetworkUuid,
        fetcher: fetchPccMinResult,
        invalidations: pccMinResultInvalidations,
    });

    const pccMinColumns = useMemo(() => {
        return pccMinResultColumnsDefinition(intl);
    }, [intl]);

    const handleTabChange = (_event: SyntheticEvent, newTabIndex: number) => {
        setTabIndex(newTabIndex);
    };

    const result = useMemo(() => {
        if (PccMinStatus !== RunningStatus.SUCCEED || !PccMinResult) {
            return {};
        }
        return PccMinResult;
    }, [PccMinStatus, PccMinResult]);

    const renderReportViewer = () => {
        return (
            <GlassPane active={isLoadingResult}>
                {(PccMinStatus === RunningStatus.SUCCEED || PccMinStatus === RunningStatus.FAILED) && (
                    <ComputationReportViewer reportType={ComputingType.PCC_MIN} />
                )}
            </GlassPane>
        );
    };

    return (
        <>
            <Box sx={styles.flexWrapper}>
                <Tabs value={tabIndex} onChange={handleTabChange} sx={styles.flexElement}>
                    <Tab label={<FormattedMessage id={'Results'} />} />
                    <Tab label={<FormattedMessage id={'ComputationResultsLogs'} />} />
                </Tabs>
                <Box sx={styles.emptySpace}></Box>
            </Box>

            {tabIndex === 0 && (
                <GlassPane active={isLoadingResult}>
                    <PccMinResults
                        result={result}
                        isLoadingResult={isLoadingResult}
                        columnDefs={pccMinColumns}
                        tableName="Results"
                    />
                </GlassPane>
            )}
            {tabIndex === 1 && renderReportViewer()}
        </>
    );
};
