/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import LogReportItem from './log-report-item';
import { v4 as uuid4 } from 'uuid';

/**
 * A LogReport is a tree that can contain 3 kinds of nodes:
 * - GlobalReport : an optional top-level node that contains only the NodeReport children
 * - NodeReport : contain a root node report having N SubReport children
 * - SubReport : contain other SubReport children, and can have some reports (log messages displayed in the right pane)
 */
export const LogReportType = {
    GlobalReport: 'global report',
    NodeReport: 'node report',
    SubReport: 'reporter',
};

export default class LogReport {
    constructor(reportType, jsonReporter, parentReportId) {
        this.id = undefined;
        this.type = reportType;
        if (reportType === LogReportType.GlobalReport) {
            // no ID for this kind of report, we have to create one
            this.nodeId = uuid4();
        } else if (reportType === LogReportType.NodeReport) {
            this.id = jsonReporter?.taskValues?.id?.value; // not unique for all nodes
            this.nodeId = jsonReporter.taskKey; // then use taskkey as unique nodeId
        } else {
            this.id = jsonReporter?.taskValues?.id?.value; // unique for all subreports
            this.nodeId = this.id;
        }
        this.key = jsonReporter.taskKey;
        this.title = LogReportItem.resolveTemplateMessage(
            jsonReporter.defaultName,
            jsonReporter.taskValues
        );
        this.subReports = [];
        this.logs = [];
        this.parentReportId = parentReportId;
        this.severity = this.initSeverity(jsonReporter);
        this.init(reportType, jsonReporter);
    }

    /**
     * A unique ID to identify a node in the tree
     */
    getNodeId() {
        return this.nodeId;
    }

    /**
     * An ID provided by the back to be used to fetch reports from the back
     */
    getId() {
        return this.id;
    }

    getType() {
        return this.type;
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

    init(reportType, jsonReporter) {
        const childType =
            reportType === LogReportType.GlobalReport
                ? LogReportType.NodeReport
                : LogReportType.SubReport;
        jsonReporter.subReporters.map((value) =>
            this.subReports.push(new LogReport(childType, value, this.nodeId))
        );
        jsonReporter.reports.map((value) =>
            this.logs.push(new LogReportItem(value, this.nodeId))
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

    getHighestSeverity() {
        let reduceFct = (p, c) => (p.level < c.level ? c : p);
        let highestSeverity = this.severity;
        return this.getSubReports()
            .map((r) => r.getHighestSeverity())
            .reduce(reduceFct, highestSeverity);
    }
}
