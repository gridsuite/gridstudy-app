/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import {
    fetchNodeReport,
    fetchParentNodesReport,
    fetchSubReport,
} from '../../../services/study';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { Box } from '@mui/system';
import ReportViewer from '../../ReportViewer/report-viewer';
import LogReportItem from '../../ReportViewer/log-report-item';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../redux/reducer.type';
import { UUID } from 'crypto';
import { ComputingType } from '../../computing-status/computing-type';

interface ComputationReportViewerProps {
    // different types for uuid to support LF, SA , etc
    studyUuid: UUID | string;
    nodeUuid: UUID | string | undefined;
    reportType: ComputingType;
}

export const ComputationReportViewer: FunctionComponent<
    ComputationReportViewerProps
> = ({ studyUuid, nodeUuid, reportType }) => {
    const [report, setReport] = useState(undefined);
    const { snackError } = useSnackMessage();
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    const makeReport = useCallback(
        (reportData: any) => {
            const nodeName = currentNode?.data.label;
            // an array with a single reporter is expected (corresponding to the current Node)
            let singleReport: any =
                Array.isArray(reportData) && reportData.length === 1
                    ? reportData[0]
                    : undefined;
            if (nodeName && singleReport) {
                singleReport.defaultName = nodeName;
            }
            return singleReport;
        },
        [currentNode?.data.label]
    );

    useEffect(() => {
        fetchParentNodesReport(
            studyUuid.toString(),
            nodeUuid?.toString(),
            true,
            LogReportItem.getDefaultSeverityList(),
            reportType.toString()
        )
            .then((fetchedReport) => {
                setReport(makeReport(fetchedReport));
            })
            .catch((error) => {
                setReport(undefined);
                snackError({
                    messageTxt: error.message,
                    headerId: 'ReportFetchError',
                });
            });
    }, [studyUuid, nodeUuid, reportType, snackError, makeReport]);

    const subReportPromise = (
        reportId: string,
        severityFilterList: string[]
    ) => {
        return fetchSubReport(
            studyUuid.toString(),
            nodeUuid?.toString(),
            reportId,
            severityFilterList
        );
    };

    const nodeReportPromise = (
        nodeId: string,
        reportId: string,
        severityFilterList: string[]
    ) => {
        return fetchNodeReport(
            studyUuid.toString(),
            nodeId,
            reportId,
            severityFilterList,
            reportType.toString()
        );
    };

    return (
        <>
            <Box sx={{ height: '4px' }}></Box>
            {report && (
                <ReportViewer
                    jsonReportTree={report}
                    subReportPromise={subReportPromise}
                    nodeReportPromise={nodeReportPromise}
                />
            )}
            ;
        </>
    );
};
