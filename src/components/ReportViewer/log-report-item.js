/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export default class LogReportItem {
    static SEVERITY = {
        UNKNOWN: {
            name: 'UNKNOWN',
            level: 0,
            colorName: 'cornflowerblue',
            colorHexCode: '#6495ED',
        },
        TRACE: {
            name: 'TRACE',
            level: 1,
            colorName: 'silver',
            colorHexCode: '#C0C0C0',
        },
        INFO: {
            name: 'INFO',
            level: 2,
            colorName: 'mediumseagreen',
            colorHexCode: '#3CB371',
        },
        WARN: {
            name: 'WARN',
            level: 3,
            colorName: 'orange',
            colorHexCode: '#FFA500',
        },
        ERROR: {
            name: 'ERROR',
            level: 4,
            colorName: 'crimson',
            colorHexCode: '#DC143C',
        },
        FATAL: {
            name: 'FATAL',
            level: 5,
            colorName: 'mediumorchid',
            colorHexCode: '#BA55D3',
        },
    };

    static resolveTemplateMessage(templateMessage, templateValues) {
        const templateVars = {};
        for (const [key, value] of Object.entries(templateValues)) {
            templateVars[key] = value.value;
        }
        return templateMessage.replace(/\${([^{}]*)}/g, function (a, b) {
            let r = templateVars[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        });
    }

    constructor(jsonReport, reportId) {
        this.key = jsonReport.reportKey;
        this.log = LogReportItem.resolveTemplateMessage(
            jsonReport.defaultMessage,
            jsonReport.values
        );
        this.reportId = reportId;
        this.severity = this.initSeverity(jsonReport.values.reportSeverity);
    }

    getLog() {
        return this.log;
    }

    getReportId() {
        return this.reportId;
    }

    getSeverity() {
        return this.severity;
    }

    getSeverityName() {
        return this.severity.name;
    }

    getColorName() {
        return this.severity.colorName;
    }

    getColorHexCode() {
        return this.severity.colorHexCode;
    }

    initSeverity(jsonSeverity) {
        let severity = LogReportItem.SEVERITY.UNKNOWN;
        if (!jsonSeverity) {
            return severity;
        }

        Object.values(LogReportItem.SEVERITY).some((value) => {
            let severityFound = jsonSeverity.value.includes(value.name);
            if (severityFound) {
                severity = value;
            }
            return severityFound;
        });

        return severity;
    }
}
