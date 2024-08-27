import { LOG_SEVERITY } from './logSeverity.constant';
import { LogSeverity, SeverityFilterConfig } from './severity.type';

export const getDefaultSeverityFilter = (severityList: string[]) => {
    const filterConfig = {} as SeverityFilterConfig;
    if (severityList?.length) {
        Object.values(LOG_SEVERITY)
            .filter((s) => severityList.includes(s.name))
            .forEach((s) => {
                filterConfig[s.name] = s.displayedByDefault;
            });
    }
    return filterConfig;
};

export function getDefaultSeverityList(): string[] {
    // return name list like ['WARN', 'INFO']
    return Object.values(LOG_SEVERITY)
        .filter((s) => s.displayedByDefault)
        .map((s) => s.name);
}

export function getHighestSeverity(severityList: string[]) {
    // We have a un-ordered list of existing severities, like ['INFO', 'ERROR', 'DEBUG'].
    // Lets find out the highest level corresponding SEVERITY object, like SEVERITY.ERROR:
    let reduceFct = (p: LogSeverity, c: LogSeverity) => (c.level > p.level ? c : p);
    let highestSeverity = LOG_SEVERITY.UNKNOWN;
    return Object.values(LOG_SEVERITY)
        .filter((s) => severityList.includes(s.name))
        .reduce(reduceFct, highestSeverity);
}
