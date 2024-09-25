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
import ReportTree from './report-tree';
import ReportItem from './report-item';
import { getDefaultSeverityFilter } from '../../utils/report-severity.utils';
import { useReportFetcher } from '../../hooks/use-report-fetcher';
import { mapReportLog, mapReportLogs } from '../../utils/report-log.mapper';
import { mapReportsTree } from '../../utils/report-tree.mapper';
import { useDispatch, useSelector } from 'react-redux';
import { setReportFilters } from '../../redux/actions';

// WARNING this file has been copied from commons-ui, and updated here. Putting it back to commons-ui has to be discussed.

const styles = {
    treeItem: {
        whiteSpace: 'nowrap',
    },
};

export default function ReportViewer({ report, reportType }) {
    const dispatch = useDispatch();

    const [expandedTreeReports, setExpandedTreeReports] = useState([]);
    const [logs, setLogs] = useState(null);
    const [highlightedReportId, setHighlightedReportId] = useState();
    const [reportVerticalPositionFromTop, setReportVerticalPositionFromTop] = useState(undefined);
    const [isLogLoading, , fetchReportLogs] = useReportFetcher(reportType);

    const selectedReportId = useSelector((state) => state.reportSelectedReportId);
    const severityFilter = useSelector((state) => state.reportSeverityFilter);
    const messageFilter = useSelector((state) => state.reportMessageFilter);

    const reportTreeData = useRef({});
    const treeView = useRef(null);

    /**
     * Build the tree view (left pane) creating all ReportItem from json data
     * @type {Function}
     */
    const initializeTreeDataAndComponent = useCallback((report) => {
        reportTreeData.current[report.id] = report;
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
    }, []);

    const refreshLogsOnSelectedReport = useCallback(
        (selectedReportId, severityFilter, messageFilter) => {
            //we need to do this check because selectedReportId can be outdated when switching between the different place we have this component
            if (reportTreeData.current[selectedReportId] != null) {
                let severityList = [];
                for (const [severity, selected] of Object.entries(severityFilter)) {
                    if (selected) {
                        severityList.push(severity);
                    }
                }
                if (severityList.length === 0) {
                    setLogs([]);
                    setHighlightedReportId(null);
                    return;
                }
                fetchReportLogs(
                    selectedReportId,
                    severityList,
                    reportTreeData.current[selectedReportId].type,
                    messageFilter
                ).then((reportLogs) => {
                    setLogs(mapReportLogs(reportLogs));
                });
            }
        },
        [fetchReportLogs]
    );

    useEffect(() => {
        refreshLogsOnSelectedReport(selectedReportId, severityFilter, messageFilter);
    }, [messageFilter, severityFilter, selectedReportId, refreshLogsOnSelectedReport]);

    useEffect(() => {
        const reportTree = mapReportsTree(report);
        treeView.current = initializeTreeDataAndComponent(reportTree);
        setExpandedTreeReports([report.id]);
        setLogs(mapReportLog(report, reportTree.severities));
        dispatch(setReportFilters(report.id, '', getDefaultSeverityFilter(reportTree.severities)));
    }, [report, initializeTreeDataAndComponent, dispatch]);

    const handleReportVerticalPositionFromTop = useCallback((node) => {
        setReportVerticalPositionFromTop(node?.getBoundingClientRect()?.top);
    }, []);

    const handleSelectNode = (_, reportId) => {
        if (selectedReportId !== reportId) {
            dispatch(
                setReportFilters(reportId, '', getDefaultSeverityFilter(reportTreeData.current[reportId].severities))
            );
        }
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
            let treeReportsToExpand = new Set(previouslyExpandedTreeReports);
            let parentId = data.parentId;
            while (reportTreeData.current[parentId]?.parentId) {
                parentId = reportTreeData.current[parentId].parentId;
                treeReportsToExpand.add(parentId);
            }
            return Array.from(treeReportsToExpand);
        });
        setHighlightedReportId(data.parentId);
    };

    return (
        report && (
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
                        expandedTreeReports={expandedTreeReports}
                        setExpandedTreeReports={setExpandedTreeReports}
                        handleSelectNode={handleSelectNode}
                    >
                        {treeView.current}
                    </ReportTree>
                </ReportTreeViewContext.Provider>
                <Grid item xs={12} sm={9} sx={{ height: '100%' }}>
                    <WaitingLoader loading={isLogLoading} message={'loadingReport'}>
                        <LogTable logs={logs} onRowClick={onLogRowClick} severityFilter={severityFilter} />
                    </WaitingLoader>
                </Grid>
            </Grid>
        )
    );
}
