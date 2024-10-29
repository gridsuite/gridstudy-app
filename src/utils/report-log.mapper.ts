/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Log, ReportLog, ReportSeverity } from '../types/report.type';
import { REPORT_SEVERITY } from './report-severity';

export const mapReportLogs = (reportLogs: ReportLog[]) => {
    const formattedLogs: Log[] = [];
    reportLogs.forEach((reportLog) => {
        formatLog(reportLog, formattedLogs);
    });
    return formattedLogs;
};

const formatLog = (reportLog: ReportLog, formattedLogs: Log[]) => {
    const highestSeverity = mapSeverity(reportLog.severity ?? [REPORT_SEVERITY.UNKNOWN.name]);
    formattedLogs.push({
        message: reportLog.message,
        severity: highestSeverity,
        parentId: reportLog.parentId,
    });
};

const mapSeverity = (severities: string[]) => {
    let reduceFct = (p: ReportSeverity, c: ReportSeverity) => (c.level > p.level ? c : p);
    let highestSeverity: ReportSeverity = REPORT_SEVERITY.UNKNOWN;
    return Object.values(REPORT_SEVERITY)
        .filter((s) => severities.includes(s.name))
        .reduce(reduceFct, highestSeverity);
};
