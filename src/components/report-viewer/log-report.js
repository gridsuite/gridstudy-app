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
        this.type = reportType;
        // id : An ID provided by the back to be used to fetch reports from the back
        // uniqueId : A unique ID to identify a node in the tree view
        //
        // Remark: uniqueId must be the same when we fetch data N times from the back
        // (because of the reverse link when we click on a report Item in the right pane)
        if (reportType === LogReportType.GlobalReport) {
            // no ID coming from the back for this kind of report, we have to create one
            this.id = undefined;
            this.uniqueId = uuid4();
        } else if (reportType === LogReportType.NodeReport) {
            this.id = jsonReporter?.taskValues?.id?.value; // not unique for all nodes
            this.uniqueId = jsonReporter.taskKey; // then use taskkey as unique Id
        } else {
            this.id = jsonReporter?.taskValues?.id?.value; // unique for all subreports
            this.uniqueId = this.id;
        }
        this.key = jsonReporter.taskKey;
        this.title = LogReportItem.resolveTemplateMessage(
            jsonReporter.defaultName,
            jsonReporter.taskValues
        );
        this.subReports = [];
        this.logs = [];
        this.parentReportId = parentReportId;
        this.init(reportType, jsonReporter);
    }

    getUniqueId() {
        return this.uniqueId;
    }

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

    getHighestSeverity(currentSeverity = LogReportItem.SEVERITY.UNKNOWN) {
        let reduceFct = (p, c) => (p.level < c.level ? c : p);

        let highestSeverity = this.getLogs()
            .map((r) => r.getSeverity())
            .reduce(reduceFct, currentSeverity);

        return this.getSubReports()
            .map((r) => r.getHighestSeverity(highestSeverity))
            .reduce(reduceFct, highestSeverity);
    }
}
