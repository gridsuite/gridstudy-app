/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Log, Report, ReportSeverity } from '../types/report.type';
import { REPORT_SEVERITY } from '../constants/report.constant';

export const mapReportLog = (report: Report) => {
    const formattedLogs: Log[] = [];
    formatReport(report, formattedLogs);
    return formattedLogs;
};

const formatReport = (report: Report, formattedLogs: Log[]) => {
    const highestSeverity = mapSeverity(report.severities ?? [REPORT_SEVERITY.UNKNOWN.name]);
    // For now, we want to display only reports that are not containers in the "log" view
    if (report.subReports.length === 0 && highestSeverity.name !== REPORT_SEVERITY.UNKNOWN.name) {
        formattedLogs.push({
            message: report.message,
            severity: highestSeverity,
            parentId: report.parentId,
        });
    }
    report.subReports.forEach((subReport: Report) => formatReport(subReport, formattedLogs));
};

const mapSeverity = (severities: string[]) => {
    let reduceFct = (p: ReportSeverity, c: ReportSeverity) => (c.level > p.level ? c : p);
    let highestSeverity: ReportSeverity = REPORT_SEVERITY.UNKNOWN;
    return Object.values(REPORT_SEVERITY)
        .filter((s) => severities.includes(s.name))
        .reduce(reduceFct, highestSeverity);
};
