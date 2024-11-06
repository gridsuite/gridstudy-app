/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReportTree, ReportType } from './report.type';
import { getHighestSeverity } from './report-severity';
import { GLOBAL_REPORT_NODE_LABEL } from './report.constant';

export function mapReportsTree(report: any, reportType?: ReportType): ReportTree {
    const severityList =
        report.severities || report.subReports.flatMap((subReport: { severities: any }) => subReport.severities);

    return {
        type: reportType ?? (report.message === GLOBAL_REPORT_NODE_LABEL ? ReportType.GLOBAL : ReportType.NODE),
        id: report.id,
        label: report.message,
        message: report.message,
        parentId: report.parentId,
        severities: severityList,
        highestSeverity: getHighestSeverity(severityList),
        subReports: report.subReports
            .filter(
                (subReport: { subReports: string | any[]; id: any }) => subReport.subReports.length > 0 || subReport.id
            )
            .map((subReport: any) => mapReportsTree(subReport, ReportType.NODE)),
        children: report.subReports
            .filter(
                (subReport: { subReports: string | any[]; id: any }) => subReport.subReports.length > 0 || subReport.id
            )
            .map((subReport: any) => mapReportsTree(subReport, ReportType.NODE)),
    } satisfies ReportTree;
}
