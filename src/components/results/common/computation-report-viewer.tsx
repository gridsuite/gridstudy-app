/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useEffect, useState } from 'react';
import ReportViewer from '../../report-viewer/report-viewer';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { ComputingType } from '../../computing-status/computing-type';
import WaitingLoader from '../../utils/waiting-loader';
import { useReportFetcher } from '../../../hooks/use-report-fetcher';
import { Report } from '../../../types/report.type';

interface ComputationReportViewerProps {
    reportType: ComputingType;
}

export const ComputationReportViewer: FunctionComponent<ComputationReportViewerProps> = ({ reportType }) => {
    const [report, setReport] = useState<Report>();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isReportLoading, fetchReport] = useReportFetcher(reportType);

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            fetchReport().then((report) => {
                if (report !== undefined) {
                    setReport(report);
                }
            });
        }
    }, [studyUuid, currentNode?.id, reportType, fetchReport]);

    return (
        <WaitingLoader loading={isReportLoading} message={'loadingReport'}>
            {report && <ReportViewer report={report} reportType={reportType} />}
        </WaitingLoader>
    );
};
