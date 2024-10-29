/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Report, ReportTree, ReportType } from '../types/report.type';
import { getHighestSeverity } from './report-severity';
import { GLOBAL_REPORT_NODE_LABEL } from '../constants/report.constant';

export function mapReportsTree(report: Report, reportType?: ReportType): ReportTree {
    const severityList = report.severities || report.subReports.flatMap((subReport) => subReport.severities);
    return {
        type: reportType ?? (report.message === GLOBAL_REPORT_NODE_LABEL ? ReportType.GLOBAL : ReportType.NODE),
        id: report.id,
        message: report.message,
        parentId: report.parentId,
        severities: severityList,
        highestSeverity: getHighestSeverity(severityList),
        subReports: report.subReports
            .filter((subReport) => subReport.subReports.length > 0 || subReport.id)
            .map((subReport) => mapReportsTree(subReport, ReportType.NODE)),
    } satisfies ReportTree;
}
