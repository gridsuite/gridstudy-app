/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import ReportViewer from '../../report-viewer/report-viewer';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { ComputingType } from '../../computing-status/computing-type';
import WaitingLoader from '../../utils/waiting-loader';
import { useReportFetcher } from '../../../hooks/use-report-fetcher';
import { Report, SeverityLevel } from '../../../utils/report/report.type';
import { BUILD_STATUS } from 'components/network/constants';
import { Box } from '@mui/material';
import { sortSeverityList } from 'utils/report/report-severity';

interface ComputationReportViewerProps {
    reportType: ComputingType;
}

export const ComputationReportViewer: FunctionComponent<ComputationReportViewerProps> = ({ reportType }) => {
    const [report, setReport] = useState<Report>();
    const [severities, setSeverities] = useState<SeverityLevel[]>();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isReportLoading, fetchReport, , fetchReportSeverities] = useReportFetcher(reportType);
    const shouldFetchReport = useMemo(
        () => studyUuid && currentNode?.id && currentNode?.data?.globalBuildStatus !== BUILD_STATUS.NOT_BUILT,
        [studyUuid, currentNode]
    );

    useEffect(() => {
        if (shouldFetchReport) {
            fetchReport().then((report) => {
                if (report !== undefined) {
                    setReport(report);
                    fetchReportSeverities?.(report?.id)?.then((severities) => {
                        setSeverities(sortSeverityList(severities));
                    });
                }
            });
        } else {
            // if the user unbuilds a node, the report needs to be reset.
            // otherwise, the report will be kept in the state and useless report fetches with previous id will be made when the user rebuilds the node.
            setReport(undefined);
            setSeverities(undefined);
        }
    }, [reportType, fetchReport, shouldFetchReport, fetchReportSeverities]);

    return (
        <WaitingLoader loading={isReportLoading} message={'loadingReport'}>
            <Box sx={{ marginTop: 1 }}>
                {shouldFetchReport && report && (
                    <ReportViewer report={report} reportType={reportType} severities={severities} />
                )}
            </Box>
        </WaitingLoader>
    );
};
