/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Log, Report, ReportSeverity } from '../types/report.type';
import { REPORT_SEVERITY } from '../constants/report.constant';

export const mapReportLog = (report: Report, severities: string[]) => {
    const formattedLogs: Log[] = [];
    formatReportLog(report, severities, formattedLogs);
    return formattedLogs;
};

const formatReportLog = (report: Report, severities: string[], formattedLogs: Log[]) => {
    const highestSeverity = mapSeverity(report.severities ?? [REPORT_SEVERITY.UNKNOWN.name]);
    // We display a report line in the "log" view for both
    // - a leaf (no sub-report)
    // - and a container (have sub-reports), if its highest severity belongs to the severity filter (or unknown)
    if (
        report.parentId != null &&
        (report.subReports.length === 0 ||
            severities.includes(highestSeverity.name) ||
            highestSeverity === REPORT_SEVERITY.UNKNOWN)
    ) {
        formattedLogs.push({
            message: report.message,
            severity: highestSeverity,
            parentId: report.parentId,
        });
    }
    report.subReports.forEach((subReport: Report) => formatReportLog(subReport, severities, formattedLogs));
};

const mapSeverity = (severities: string[]) => {
    let reduceFct = (p: ReportSeverity, c: ReportSeverity) => (c.level > p.level ? c : p);
    let highestSeverity: ReportSeverity = REPORT_SEVERITY.UNKNOWN;
    return Object.values(REPORT_SEVERITY)
        .filter((s) => severities.includes(s.name))
        .reduce(reduceFct, highestSeverity);
};
