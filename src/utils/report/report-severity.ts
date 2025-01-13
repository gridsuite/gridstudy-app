/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReportSeverity, SeverityLevel } from './report.type';

export const REPORT_SEVERITY: Record<SeverityLevel, ReportSeverity> = {
    UNKNOWN: {
        name: 'UNKNOWN',
        level: 0,
        colorName: 'cornflowerblue',
        colorHexCode: '#6495ED',
        displayedByDefault: false,
        displayedByDefaultForReportContainer: false,
    },
    TRACE: {
        name: 'TRACE',
        level: 1,
        colorName: 'SlateGray',
        colorHexCode: '#708090',
        displayedByDefault: false,
        displayedByDefaultForReportContainer: true,
    },
    DEBUG: {
        name: 'DEBUG',
        level: 2,
        colorName: 'DarkCyan',
        colorHexCode: '#008B8B',
        displayedByDefault: false,
        displayedByDefaultForReportContainer: true,
    },
    INFO: {
        name: 'INFO',
        level: 3,
        colorName: 'mediumseagreen',
        colorHexCode: '#3CB371',
        displayedByDefault: true,
        displayedByDefaultForReportContainer: true,
    },
    WARN: {
        name: 'WARN',
        level: 4,
        colorName: 'orange',
        colorHexCode: '#FFA500',
        displayedByDefault: true,
        displayedByDefaultForReportContainer: true,
    },
    ERROR: {
        name: 'ERROR',
        level: 5,
        colorName: 'crimson',
        colorHexCode: '#DC143C',
        displayedByDefault: true,
        displayedByDefaultForReportContainer: true,
    },
    FATAL: {
        name: 'FATAL',
        level: 6,
        colorName: 'mediumorchid',
        colorHexCode: '#BA55D3',
        displayedByDefault: true,
        displayedByDefaultForReportContainer: true,
    },
};

export const getDefaultSeverityFilter = (severityList: string[]): string[] => {
    const severityFilter: string[] = [];
    if (severityList?.length) {
        Object.values(REPORT_SEVERITY)
            .filter((s) => severityList.includes(s.name))
            .forEach((s) => {
                if (s.displayedByDefault) {
                    severityFilter.push(s.name);
                }
            });
    }
    return severityFilter;
};

export function sortSeverityList(severityList: SeverityLevel[]): SeverityLevel[] {
    return severityList.sort((a, b) => REPORT_SEVERITY[b].level - REPORT_SEVERITY[a].level);
}

export function getContainerDefaultSeverityList(): string[] {
    // return name list like ['WARN', 'INFO']
    return Object.values(REPORT_SEVERITY)
        .filter((s) => s.displayedByDefaultForReportContainer)
        .map((s) => s.name);
}
