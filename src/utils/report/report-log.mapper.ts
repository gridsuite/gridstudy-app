/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { REPORT_SEVERITY } from './report-severity';
import { Log, ReportLog } from './report.type';

export const mapReportLogs = (reportLogs: ReportLog[]) => {
    const formattedLogs: Log[] = [];
    reportLogs.forEach((reportLog) => {
        formatLog(reportLog, formattedLogs);
    });
    return formattedLogs;
};

const formatLog = (reportLog: ReportLog, formattedLogs: Log[]) => {
    formattedLogs.push({
        message: reportLog.message,
        severity: Object.values(REPORT_SEVERITY).find((s) => reportLog.severity === s.name) ?? REPORT_SEVERITY.UNKNOWN,
        parentId: reportLog.parentId,
    });
};
