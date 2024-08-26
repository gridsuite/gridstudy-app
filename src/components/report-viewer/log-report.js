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
            this.id = jsonReporter.id; // not unique for all nodes
            this.uniqueId = jsonReporter.message; // then use message/nodeId as unique Id
        } else {
            this.id = jsonReporter.id; // unique for all subreports
            this.uniqueId = this.id;
        }
        this.title = jsonReporter?.title ?? jsonReporter.message;
        this.children = [];
        this.logs = [];
        this.parentReportId = parentReportId;
        // The different severities available (in the back) for this report (not including the subreports)
        this.severityList = [];
        // Represent all the different severities of this report and it's subreports
        this.allSeverityList = [];
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

    getChildren() {
        return this.children;
    }

    getLogs() {
        return this.logs;
    }

    getSeverityList() {
        return this.severityList;
    }

    getAllSeverityList() {
        return this.allSeverityList;
    }

    getAllLogs() {
        return this.getLogs().concat(this.getChildren().flatMap((r) => r.getAllLogs()));
    }

    init(reportType, jsonReporter) {
        const childType =
            reportType === LogReportType.GlobalReport ? LogReportType.NodeReport : LogReportType.SubReport;
        jsonReporter.subReports.forEach((value) => {
            if (value.subReports.length > 0 || value.id) {
                this.children.push(new LogReport(childType, value, this.uniqueId));
            } else {
                this.logs.push(new LogReportItem(value, this.uniqueId));
            }
        });
        this.severityList = jsonReporter.severities ?? []; // local value
        this.initAllSeverityList().map((e) => this.allSeverityList.push(e)); // computed tree value
    }

    getHighestSeverity() {
        // We have a un-ordered list of existing severities, like ['INFO', 'ERROR', 'DEBUG'].
        // Lets find out the highest level corresponding SEVERITY object, like SEVERITY.ERROR:
        let reduceFct = (p, c) => (c.level > p.level ? c : p);
        let highestSeverity = LogReportItem.SEVERITY.UNKNOWN;
        return Object.values(LogReportItem.SEVERITY)
            .filter((s) => this.allSeverityList.includes(s.name))
            .reduce(reduceFct, highestSeverity);
    }

    initAllSeverityList() {
        let logSeverityList = this.getSeverityList();

        this.getChildren()
            .map((e) => e.initAllSeverityList())
            .forEach((e) => {
                logSeverityList = [...new Set([...logSeverityList, ...e])];
            });

        return logSeverityList;
    }
}
