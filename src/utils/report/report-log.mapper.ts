/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { REPORT_SEVERITY } from './report-severity';
import { Log, ReportLog } from './report.type';
import { makeNodeKey } from './report.constant';

export const mapReportLogs = (reportLogs: ReportLog[], reportId?: string | null) => {
    const formattedLogs: Log[] = [];
    const minDepth = Math.min(...reportLogs.map((log) => log.depth ?? 0));
    reportLogs.forEach((reportLog) => {
        formatLog(minDepth, reportLog, formattedLogs, reportId);
    });
    return formattedLogs;
};

const formatLog = (minDepth: number, reportLog: ReportLog, formattedLogs: Log[], reportId?: string | null) => {
    const severity =
        Object.values(REPORT_SEVERITY).find((s) => reportLog.severity === s.name) ?? REPORT_SEVERITY.UNKNOWN;
    const parentId =
        reportLog.parentOrder != null && reportId ? makeNodeKey(reportId, reportLog.parentOrder) : null;
    formattedLogs.push({
        message: reportLog.message,
        severity: severity.name,
        backgroundColor: severity.colorName,
        depth: (reportLog.depth ?? 0) - minDepth,
        parentId,
    });
};
