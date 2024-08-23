/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// WARNING this file has been copied from commons-ui, and updated here. Putting it back to commons-ui has to be discussed.

export default class LogReportItem {
    static SEVERITY = {
        UNKNOWN: {
            name: 'UNKNOWN',
            level: 0,
            colorName: 'cornflowerblue',
            colorHexCode: '#6495ED',
            displayedByDefault: false,
        },
        TRACE: {
            name: 'TRACE',
            level: 1,
            colorName: 'SlateGray',
            colorHexCode: '#708090',
            displayedByDefault: false,
        },
        DEBUG: {
            name: 'DEBUG',
            level: 2,
            colorName: 'DarkCyan',
            colorHexCode: '#008B8B',
            displayedByDefault: false,
        },
        INFO: {
            name: 'INFO',
            level: 3,
            colorName: 'mediumseagreen',
            colorHexCode: '#3CB371',
            displayedByDefault: true,
        },
        WARN: {
            name: 'WARN',
            level: 4,
            colorName: 'orange',
            colorHexCode: '#FFA500',
            displayedByDefault: true,
        },
        ERROR: {
            name: 'ERROR',
            level: 5,
            colorName: 'crimson',
            colorHexCode: '#DC143C',
            displayedByDefault: true,
        },
        FATAL: {
            name: 'FATAL',
            level: 6,
            colorName: 'mediumorchid',
            colorHexCode: '#BA55D3',
            displayedByDefault: true,
        },
    };

    static getDefaultSeverityFilter(severityList) {
        const filterConfig = {};
        if (severityList?.length) {
            Object.values(LogReportItem.SEVERITY)
                .filter((s) => severityList.includes(s.name))
                .forEach((s) => {
                    filterConfig[s.name] = s.displayedByDefault;
                });
        }
        return filterConfig;
    }

    static getDefaultSeverityList() {
        // return name list like ['WARN', 'INFO']
        return Object.values(LogReportItem.SEVERITY)
            .filter((s) => s.displayedByDefault)
            .map((s) => s.name);
    }

    constructor(jsonReport, reportId) {
        this.log = jsonReport.message;
        this.reportId = reportId;
        this.severity = this.initSeverity(jsonReport.severities[0]);
    }

    getLog() {
        return this.log;
    }

    getReportId() {
        return this.reportId;
    }

    getSeverityName() {
        return this.severity.name;
    }

    getColorName() {
        return this.severity.colorName;
    }

    displayedByDefault() {
        return this.severity.displayedByDefault();
    }

    initSeverity(jsonSeverity) {
        let severity = LogReportItem.SEVERITY.UNKNOWN;
        if (!jsonSeverity) {
            return severity;
        }
        // check jsonSeverity string is a valid SEVERITY value
        Object.values(LogReportItem.SEVERITY).some((value) => {
            let severityFound = jsonSeverity === value.name;
            if (severityFound) {
                severity = value;
            }
            return severityFound;
        });
        return severity;
    }
}
