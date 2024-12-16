/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Report, ReportTree, ReportType } from './report.type';
import { GLOBAL_REPORT_NODE_LABEL } from './report.constant';
import { REPORT_SEVERITY } from './report-severity';

export function mapReportsTree(report: Report, reportType?: ReportType): ReportTree {
    return {
        type: reportType ?? (report.message === GLOBAL_REPORT_NODE_LABEL ? ReportType.GLOBAL : ReportType.NODE),
        id: report.id,
        message: report.message,
        parentId: report.parentId,
        severity: Object.values(REPORT_SEVERITY).find((s) => report.severity === s.name) ?? REPORT_SEVERITY.UNKNOWN,
        subReports: report.subReports
            .filter((subReport) => subReport.subReports.length > 0 || subReport.id)
            .map((subReport) => mapReportsTree(subReport, ReportType.NODE)),
    } satisfies ReportTree;
}
