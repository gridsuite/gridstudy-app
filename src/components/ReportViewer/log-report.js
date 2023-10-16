/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import LogReportItem from './log-report-item';

import { v4 as uuid4 } from 'uuid';

export default class LogReport {
    constructor(jsonReporter, parentReportId) {
        this.reportId = undefined;
        if (jsonReporter?.taskValues?.id?.type === 'ID') {
            // Reporter case
            // we store the reporterId for direct access to its logs
            this.id = jsonReporter.taskValues.id.value;
            this.isGlobal = false;
            this.isNode = false;
        } else {
            // Node (or global all-nodes) case
            this.id = uuid4();
            this.isGlobal = jsonReporter?.taskValues?.globalReport?.value;
            this.isNode = !this.isGlobal;
            if (this.isNode) {
                // For each Modification Node, we should get the reportId (if some logs are present)
                this.reportId = jsonReporter?.taskValues?.reportId?.value;
            }
        }
        this.key = jsonReporter.taskKey;
        this.title = LogReportItem.resolveTemplateMessage(
            jsonReporter.defaultName ? jsonReporter.defaultName : this.id,
            jsonReporter.taskValues
        );
        this.subReports = [];
        this.logs = [];
        this.parentReportId = parentReportId;
        this.severity = this.initSeverity(jsonReporter);
        this.init(jsonReporter);
    }

    getId() {
        return this.id;
    }

    isGlobalLog() {
        return this.isGlobal;
    }

    isModificationNode() {
        return this.isNode;
    }

    getNodeReportId() {
        return this.isModificationNode() ? this.reportId : undefined;
    }

    getTitle() {
        return this.title;
    }

    getKey() {
        return this.key;
    }

    getSubReports() {
        return this.subReports;
    }

    getLogs() {
        return this.logs;
    }

    getAllLogs() {
        return this.getLogs().concat(
            this.getSubReports().flatMap((r) => r.getAllLogs())
        );
    }

    init(jsonReporter) {
        jsonReporter.subReporters.map((value) =>
            this.subReports.push(new LogReport(value, this.id))
        );
        jsonReporter.reports.map((value) =>
            this.logs.push(new LogReportItem(value, this.id))
        );
    }

    initSeverity(jsonReporter) {
        let severity = LogReportItem.SEVERITY.UNKNOWN;
        if (jsonReporter?.taskValues?.reporterSeverity?.type === 'SEVERITY') {
            let reporterSeverity =
                jsonReporter.taskValues.reporterSeverity.value;
            Object.values(LogReportItem.SEVERITY).some((value) => {
                let severityFound = reporterSeverity === value.name;
                if (severityFound) {
                    severity = value;
                }
                return severityFound;
            });
        }
        return severity;
    }

    getHighestSeverity(currentSeverity = LogReportItem.SEVERITY.UNKNOWN) {
        let reduceFct = (p, c) => (p.level < c.level ? c : p);
        let highestSeverity = this.severity;
        return this.getSubReports()
            .map((r) => r.getHighestSeverity(highestSeverity))
            .reduce(reduceFct, highestSeverity);
    }
}
