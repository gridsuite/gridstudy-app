/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import { mapReportToReportTree } from './reportTreeMapper';
import { REPORT_TYPE } from './reportType.constant';
import { LogView } from './LogView';
import { ReportTreeView } from './ReportTreeView';

// WARNING this file has been copied from commons-ui, and updated here. Putting it back to commons-ui has to be discussed.

const MAX_SUB_REPORTS = 500;
export const GLOBAL_NODE_TASK_KEY = 'Logs';

export default function ReportViewer({
    jsonReportTree,
    nodeReportPromise,
    globalReportPromise = undefined,
    maxSubReports = MAX_SUB_REPORTS,
}) {
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [highlightedReportId, setHighlightedReportId] = useState(undefined);
    const [reportVerticalPositionFromTop, setReportVerticalPositionFromTop] = useState(undefined);

    const reportTreeData = useRef({});

    const reportType = useMemo(
        () => (jsonReportTree.message === GLOBAL_NODE_TASK_KEY ? REPORT_TYPE.GLOBAL : REPORT_TYPE.NODE),
        [jsonReportTree]
    );

    const mappedReport = useMemo(() => mapReportToReportTree(jsonReportTree, reportType), [jsonReportTree, reportType]);

    /**
     * Build the tree view (left pane) creating all ReportItem from json data
     * @type {Function}
     */
    const createReporterItem = useCallback(
        (report) => {
            reportTreeData.current[report.id] = report;
            if (report.subReports.length > maxSubReports) {
                console.warn(
                    'The number (%s) being greater than %s only the first %s subreports will be displayed',
                    report.subReports.length,
                    maxSubReports,
                    maxSubReports
                );
            }
            report.subReports.forEach((subReport) => createReporterItem(subReport));
        },
        [maxSubReports]
    );

    const getFetchPromise = useCallback(
        (reportId, severityList) => {
            if (reportTreeData.current[reportId] !== undefined) {
                if (reportTreeData.current[reportId].type === REPORT_TYPE.NODE) {
                    return nodeReportPromise(reportTreeData.current[reportId].id, severityList);
                } else {
                    return globalReportPromise(severityList);
                }
            }
        },
        [nodeReportPromise, globalReportPromise]
    );

    useEffect(() => {
        createReporterItem(mappedReport);
        setSelectedReportId(mappedReport.id);
        setHighlightedReportId(undefined);
    }, [createReporterItem, mappedReport]);

    const handleReportVerticalPositionFromTop = useCallback((node) => {
        setReportVerticalPositionFromTop(node?.getBoundingClientRect()?.top);
    }, []);

    const handleSelectNode = (_, reportId) => {
        if (selectedReportId !== reportId) {
            setSelectedReportId(reportId);
            setHighlightedReportId(undefined);
        }
    };

    const onLogRowClick = (data) => {
        setHighlightedReportId(data.reportId);
    };

    console.log(`rendering report viewer`);

    return (
        mappedReport && (
            <Grid
                container
                ref={handleReportVerticalPositionFromTop}
                sx={{
                    // We calculate the remaining height relative to the viewport and the top position of the report.
                    height:
                        'calc(100vh - ' +
                        (reportVerticalPositionFromTop || '160') + // The value 160 is fine, but leaves a gap below the report.
                        'px)',
                }}
            >
                <ReportTreeView
                    selectedReportId={selectedReportId}
                    report={mappedReport}
                    reportTreeMapRef={reportTreeData}
                    highlightedReportId={highlightedReportId}
                    onSelectReport={handleSelectNode}
                />
                <LogView
                    selectedReportId={selectedReportId}
                    onLogRowClick={onLogRowClick}
                    globalReportPromise={globalReportPromise}
                    nodeReportPromise={nodeReportPromise}
                    reportTreeMapRef={reportTreeData}
                />
            </Grid>
        )
    );
}
