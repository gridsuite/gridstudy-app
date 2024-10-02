/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReportSeverity, SeverityFilter } from '../types/report.type';
import { REPORT_SEVERITY } from '../constants/report.constant';

export const getDefaultSeverityFilter = (severityList: string[]) => {
    const severityFilter = {} as SeverityFilter;
    if (severityList?.length) {
        Object.values(REPORT_SEVERITY)
            .filter((s) => severityList.includes(s.name))
            .forEach((s) => {
                severityFilter[s.name] = s.displayedByDefault;
            });
    }
    return severityFilter;
};

export function getDefaultSeverityList(): string[] {
    // return name list like ['WARN', 'INFO']
    return Object.values(REPORT_SEVERITY)
        .filter((s) => s.displayedByDefault)
        .map((s) => s.name);
}

export function getContainerDefaultSeverityList(): string[] {
    // return name list like ['WARN', 'INFO']
    return Object.values(REPORT_SEVERITY)
        .filter((s) => s.displayedByDefaultForReportContainer)
        .map((s) => s.name);
}

export function getHighestSeverity(severityList: string[]) {
    // We have a un-ordered list of existing severities, like ['INFO', 'ERROR', 'DEBUG'].
    // Lets find out the highest level corresponding SEVERITY object, like SEVERITY.ERROR:
    let reduceFct = (p: ReportSeverity, c: ReportSeverity) => (c.level > p.level ? c : p);
    let highestSeverity = REPORT_SEVERITY.UNKNOWN;
    return Object.values(REPORT_SEVERITY)
        .filter((s) => severityList.includes(s.name))
        .reduce(reduceFct, highestSeverity);
}
