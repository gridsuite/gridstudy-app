import { Log, Report } from './Report.type';
import { LOG_SEVERITY } from './logSeverity.constant';
import { LogSeverity } from './severity.type';

export const mapReportToReportItems = (report: Report | Report[]) => {
    const formattedLogs: Log[] = [];
    if (Array.isArray(report)) {
        report.forEach((r) => formatReport(r, formattedLogs));
    } else {
        formatReport(report, formattedLogs);
    }
    return formattedLogs;
};

const formatReport = (report: Report, formattedLogs: Log[]) => {
    formattedLogs.push({
        message: report.message,
        severity: mapSeverity(report.severities ?? [LOG_SEVERITY.UNKNOWN.name]),
        reportId: report.parentId,
    });
    report.subReports.forEach((subReport: Report) => formatReport(subReport, formattedLogs));
};

export const mapSeverity = (severities: string[]) => {
    let reduceFct = (p: LogSeverity, c: LogSeverity) => (c.level > p.level ? c : p);
    let highestSeverity: LogSeverity = LOG_SEVERITY.UNKNOWN;
    return Object.values(LOG_SEVERITY)
        .filter((s) => severities.includes(s.name))
        .reduce(reduceFct, highestSeverity);
};
