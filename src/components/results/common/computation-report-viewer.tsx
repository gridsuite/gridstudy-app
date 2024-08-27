/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { fetchNodeReport, fetchParentNodesReport } from '../../../services/study';
import { useSnackMessage } from '@gridsuite/commons-ui';
import ReportViewer from '../../report-viewer/report-viewer';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { ComputingType } from '../../computing-status/computing-type';
import WaitingLoader from '../../utils/waiting-loader';
import { getDefaultSeverityList } from '../../report-viewer/severity.utils';

interface ComputationReportViewerProps {
    reportType: ComputingType;
}

export const ComputationReportViewer: FunctionComponent<ComputationReportViewerProps> = ({ reportType }) => {
    const [report, setReport] = useState(undefined);
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [waitingLoadReport, setWaitingLoadReport] = useState(false);

    const makeReport = useCallback(
        (reportData: any) => {
            const nodeName = currentNode?.data.label;
            // an array with a single reporter is expected (corresponding to the current Node)
            let singleReport: any = Array.isArray(reportData) && reportData.length === 1 ? reportData[0] : undefined;
            if (nodeName && singleReport) {
                singleReport.message = nodeName;
            }
            return singleReport;
        },
        [currentNode?.data.label]
    );

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            // use a timout to avoid having a loader in case of fast promise return (avoid blink)
            const timer = setTimeout(() => {
                setWaitingLoadReport(true);
            }, 700);

            fetchParentNodesReport(
                studyUuid.toString(),
                currentNode.id.toString(),
                true,
                getDefaultSeverityList(),
                reportType
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
                })
                .finally(() => {
                    clearTimeout(timer);
                    setWaitingLoadReport(false);
                });
        }
    }, [studyUuid, currentNode?.id, reportType, snackError, makeReport]);

    const nodeReportPromise = (reportId: string, severityFilterList: string[]) => {
        return fetchNodeReport(studyUuid?.toString(), currentNode?.id, reportId, severityFilterList);
    };

    return (
        <WaitingLoader loading={waitingLoadReport} message={'loadingReport'}>
            {report && <ReportViewer jsonReportTree={report} nodeReportPromise={nodeReportPromise} />}
        </WaitingLoader>
    );
};
