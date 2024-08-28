import { v4 as uuid4 } from 'uuid';
import { Report } from './Report.type';
import { getHighestSeverity } from './severity.utils';
import { LogSeverity } from './severity.type';
import { REPORT_TYPE } from './reportType.constant';
import { GLOBAL_NODE_TASK_KEY } from './report-viewer';

export type ReportTree = {
    type: string;
    id: string;
    message: string;
    parentId?: string;
    severities: string[];
    highestSeverity: LogSeverity;
    subReports: ReportTree[];
};

export function mapReportToReportTree(report: Report, reportType: string): ReportTree {
    const severityList = report.severities ?? report.subReports.flatMap((subReport) => subReport.severities);
    return {
        type: reportType,
        id: report.id ?? uuid4(),
        message: report.message,
        parentId: report.parentId,
        severities: severityList,
        highestSeverity: getHighestSeverity(severityList),
        subReports: report.subReports
            .filter((subReport) => subReport.subReports.length > 0 || subReport.id)
            .map((subReport) => mapReportToReportTree(subReport, REPORT_TYPE.NODE)),
    };
}

export function makeSingleReport(report: Report | Report[], nodesNames?: Map<string, string>) {
    let singleReport: Report;
    if (!Array.isArray(report)) {
        singleReport = setNodeName(report, nodesNames);
    } else {
        if (report.length === 1) {
            singleReport = setNodeName(report[0], nodesNames);
        } else {
            singleReport = {
                message: GLOBAL_NODE_TASK_KEY,
                subReports: report.map((r) => setNodeName(r, nodesNames)),
            } as Report;
        }
    }
    return mapReportToReportTree(
        singleReport,
        singleReport.message === GLOBAL_NODE_TASK_KEY ? REPORT_TYPE.GLOBAL : REPORT_TYPE.NODE
    );
}

function setNodeName(report: Report, nodesNames?: Map<string, string>) {
    if (report.message !== 'Root') {
        report.message = nodesNames?.get(report.message) ?? report.message;
    }
    return report;
}
