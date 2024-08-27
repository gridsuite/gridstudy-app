import { v4 as uuid4 } from 'uuid';
import { Report } from './Report.type';
import { getHighestSeverity } from './severity.utils';
import { LogSeverity } from './severity.type';
import { REPORT_TYPE } from './reportType.constant';

export type ReportTree = {
    type: string;
    id: string;
    message: string;
    parentReportId?: string;
    severityList: string[];
    highestSeverity: LogSeverity;
    subReports: ReportTree[];
};

export function mapReportToReportTree(report: Report, reportType: string): ReportTree {
    const severityList = report.severities ?? report.subReports.flatMap((subReport) => subReport.severities);
    return {
        type: reportType,
        id: report.id ?? uuid4(),
        message: report.message,
        parentReportId: report.parentId,
        severityList,
        highestSeverity: getHighestSeverity(severityList),
        subReports: report.subReports
            .filter((subReport) => subReport.subReports.length > 0 || subReport.id)
            .map((subReport) => mapReportToReportTree(subReport, REPORT_TYPE.NODE)),
    };
}
