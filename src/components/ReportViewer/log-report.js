/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import LogReportItem from './log-report-item';
import { v4 as uuid4 } from 'uuid';

// WARNING this file has been copied from commons-ui, and updated here. Putting it back to commons-ui has to be discussed.

/**
 * A LogReport is a tree that can contain 3 kinds of nodes:
 * - GlobalReport : an optional top-level node that contains only the NodeReport children
 * - NodeReport : contain a root node report having N SubReport children
 * - SubReport : contain other SubReport children, and can have some reports (log messages displayed in the right pane)
 */
export const LogReportType = {
    GlobalReport: 'GlobalReport',
    NodeReport: 'NodeReport',
    SubReport: 'SubReport',
};

export default class LogReport {
    constructor(reportType, jsonReporter, parentReportId) {
        this.uniqueId = uuid4(); // tree view unique node id
        this.id = undefined; // id coming from report-server
        this.type = reportType;
        if (reportType === LogReportType.NodeReport || reportType === LogReportType.SubReport) {
            this.id = jsonReporter?.taskValues?.id?.value;
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
     * A unique ID to identify a node in the tree view
     */
    getUniqueId() {
        return this.uniqueId;
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
            this.subReports.push(new LogReport(childType, value, this.uniqueId))
        );
        jsonReporter.reports.map((value) =>
            this.logs.push(new LogReportItem(value, this.uniqueId))
        );
    }

    initSeverity(jsonReporter) {
        let severity = LogReportItem.SEVERITY.UNKNOWN;
        if (jsonReporter?.taskValues?.reporterSeverity?.type === 'SEVERITY') {
            let reporterSeverity =
                jsonReporter.taskValues.reporterSeverity.value;
            Object.values(LogReportItem.SEVERITY).some((value) => {
                if (reporterSeverity === value.name) {
                    severity = value;
                    return true;
                }
                return false;
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
