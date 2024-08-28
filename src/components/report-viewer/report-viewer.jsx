/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import LogTable from './log-table';
import ReportTreeViewContext from './report-tree-view-context';
import WaitingLoader from '../utils/waiting-loader';
import { mapReportToReportItems } from './reportItemMapper';
import { getDefaultSeverityFilter } from './severity.utils';
import { ReportTree } from './ReportTree';
import ReportItem from './report-item';
import { useReportFetcher } from '../../hooks/useReportFetcher';
import { REPORT_TYPES } from '../utils/report-type';

// WARNING this file has been copied from commons-ui, and updated here. Putting it back to commons-ui has to be discussed.

const MAX_SUB_REPORTS = 500;
export const GLOBAL_NODE_TASK_KEY = 'Logs';

const styles = {
    treeView: {
        height: '100%',
    },
    treeItem: {
        whiteSpace: 'nowrap',
    },
};

export default function ReportViewer({ reportsTree, maxSubReports = MAX_SUB_REPORTS }) {
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [expandedTreeReports, setExpandedTreeReports] = useState([]);
    const [logs, setLogs] = useState(null);
    const [highlightedReportId, setHighlightedReportId] = useState();
    const [selectedSeverity, setSelectedSeverity] = useState(getDefaultSeverityFilter());
    const [reportVerticalPositionFromTop, setReportVerticalPositionFromTop] = useState(undefined);
    const [isLoading, , fetchLogs] = useReportFetcher(REPORT_TYPES.NETWORK_MODIFICATION);

    const reportTreeData = useRef({});
    const treeView = useRef(null);

    /**
     * Build the tree view (left pane) creating all ReportItem from json data
     * @type {Function}
     */
    const initializeTreeDataAndComponent = useCallback(
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
            return (
                <ReportItem
                    labelText={report.message}
                    labelIconColor={report.highestSeverity.colorName}
                    key={report.id}
                    sx={styles.treeItem}
                    nodeId={report.id}
                >
                    {report.subReports.map((value) => initializeTreeDataAndComponent(value))}
                </ReportItem>
            );
        },
        [maxSubReports]
    );

    const refreshLogsOnSelectedReport = useCallback(
        (reportId, severityFilter) => {
            let severityList = [];
            for (const [severity, selected] of Object.entries(severityFilter)) {
                if (selected) {
                    severityList.push(severity);
                }
            }

            if (severityList.length === 0) {
                // no severity => there is no log to fetch, no need to request the back-end
                setSelectedReportId(reportId);
                setLogs([]);
                setHighlightedReportId(null);
                return;
            }

            fetchLogs(reportId, severityList, reportTreeData.current[reportId].type).then((logs) => {
                if (logs) {
                    setLogs(logs);
                    setSelectedReportId(reportId);
                    setHighlightedReportId(null);
                }
            });
        },
        [fetchLogs]
    );

    useEffect(() => {
        treeView.current = initializeTreeDataAndComponent(reportsTree);
        setSelectedReportId(reportsTree.id);
        setExpandedTreeReports([reportsTree.id]);
        setLogs(mapReportToReportItems(reportsTree));
        setSelectedSeverity(getDefaultSeverityFilter(reportsTree.severities));
    }, [reportsTree, initializeTreeDataAndComponent]);

    const handleReportVerticalPositionFromTop = useCallback((node) => {
        setReportVerticalPositionFromTop(node?.getBoundingClientRect()?.top);
    }, []);

    const handleSelectNode = (_, reportId) => {
        if (selectedReportId !== reportId) {
            const updatedSeverityList = getDefaultSeverityFilter(reportTreeData.current[reportId].severities);
            setSelectedSeverity(updatedSeverityList);
            refreshLogsOnSelectedReport(reportId, updatedSeverityList);
        }
    };

    const onSeverityChange = (newSeverityFilter) => {
        refreshLogsOnSelectedReport(selectedReportId, newSeverityFilter);
        setSelectedSeverity(newSeverityFilter);
    };

    // The MUI TreeView/TreeItems use useMemo on our items, so it's important to avoid changing the context
    const isHighlighted = useMemo(
        () => ({
            isHighlighted: (reportId) => highlightedReportId === reportId,
        }),
        [highlightedReportId]
    );

    const onLogRowClick = (data) => {
        setExpandedTreeReports((previouslyExpandedTreeReports) => {
            let treeReportsToExpand = [];
            let reportId = data.reportId;
            while (reportTreeData.current[reportId]?.parentId) {
                let parentId = reportTreeData.current[reportId].parentId;
                if (!previouslyExpandedTreeReports.includes(parentId)) {
                    treeReportsToExpand.push(parentId);
                }
                reportId = parentId;
            }
            if (treeReportsToExpand.length > 0) {
                return treeReportsToExpand.concat(previouslyExpandedTreeReports);
            } else {
                return previouslyExpandedTreeReports;
            }
        });
        setHighlightedReportId(data.reportId);
    };

    return (
        reportsTree && (
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
                {/*Passing a ref to isHighlighted to all children (here
                    TreeItems) wouldn't work since TreeView children are
                    memoized and would then be rerendered only when TreeView is
                    rerendered. That's why we pass the isHighlighted callback in
                    a new context, to which all children subscribe and as soon
                    as the context is modified, children will be rerendered
                    accordingly */}
                <ReportTreeViewContext.Provider value={isHighlighted}>
                    {/*TODO do we need to useMemo/useCallback these props to avoid rerenders ?*/}
                    <ReportTree
                        selectedReportId={selectedReportId}
                        treeView={treeView}
                        expandedTreeReports={expandedTreeReports}
                        setExpandedTreeReports={setExpandedTreeReports}
                        handleSelectNode={handleSelectNode}
                    />
                </ReportTreeViewContext.Provider>
                <Grid item xs={12} sm={9} sx={{ height: '100%' }}>
                    <WaitingLoader loading={isLoading} message={'loadingReport'}>
                        <LogTable
                            logs={logs}
                            onRowClick={onLogRowClick}
                            selectedSeverity={selectedSeverity}
                            setSelectedSeverity={onSeverityChange}
                        />
                    </WaitingLoader>
                </Grid>
            </Grid>
        )
    );
}
