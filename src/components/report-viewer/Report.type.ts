import { LogSeverity } from './severity.type';

export type Report = {
    message: string;
    severities: string[];
    parentId?: string;
    id: string;
    subReports: Report[];
};

export type Log = {
    message: string;
    severity: LogSeverity;
    reportId?: string;
};
