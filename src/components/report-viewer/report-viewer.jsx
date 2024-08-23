/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TreeView } from '@mui/x-tree-view/TreeView';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ReportItem from './report-item';
import LogReport, { LogReportType } from './log-report';
import Grid from '@mui/material/Grid';
import LogTable from './log-table';
import ReportTreeViewContext from './report-tree-view-context';
import { useSnackMessage } from '@gridsuite/commons-ui';
import WaitingLoader from '../utils/waiting-loader';
import LogReportItem from './log-report-item';

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

export default function ReportViewer({
    jsonReportTree,
    nodeReportPromise,
    globalReportPromise = undefined,
    maxSubReports = MAX_SUB_REPORTS,
}) {
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [expandedTreeReports, setExpandedTreeReports] = useState([]);
    const [logs, setLogs] = useState(null);
    const [waitingLoadReport, setWaitingLoadReport] = useState(false);
    const [highlightedReportId, setHighlightedReportId] = useState();
    const [selectedSeverity, setSelectedSeverity] = useState(LogReportItem.getDefaultSeverityFilter());
    const [reportVerticalPositionFromTop, setReportVerticalPositionFromTop] = useState(undefined);

    const { snackError } = useSnackMessage();

    const rootReport = useRef(null);
    const reportTreeData = useRef({});
    const treeView = useRef(null);

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
            return (
                <ReportItem
                    labelText={report.message}
                    labelIconColor={report.highestSeverity.colorName}
                    key={report.id}
                    sx={styles.treeItem}
                    nodeId={report.id}
                >
                    {report.subReports.map((value) => createReporterItem(value))}
                </ReportItem>
            );
        },
        [maxSubReports]
    );

    /**
     * Check the json data, and possibly create an extra top-level reporter called 'Logs' for the GlobalNode
     * @param reportData incoming Json data
     */
    const makeReport = (reportData) => {
        if (!Array.isArray(reportData)) {
            return reportData;
        } else {
            if (reportData.length === 1) {
                return reportData[0];
            }
            return {
                message: GLOBAL_NODE_TASK_KEY,
                subReports: reportData,
            };
        }
    };

    const getFetchPromise = useCallback(
        (reportId, severityList) => {
            if (reportTreeData.current[reportId].type === LogReportType.NodeReport) {
                return nodeReportPromise(reportTreeData.current[reportId].id, severityList);
            } else {
                return globalReportPromise(severityList);
            }
        },
        [nodeReportPromise, globalReportPromise]
    );

    const buildLogReport = useCallback((jsonData) => {
        return jsonData.message === GLOBAL_NODE_TASK_KEY
            ? new LogReport(LogReportType.GlobalReport, jsonData)
            : new LogReport(LogReportType.NodeReport, jsonData);
    }, []);

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

            // use a timout to avoid having a loader in case of fast promise return (avoid blink)
            const timer = setTimeout(() => {
                setWaitingLoadReport(true);
            }, 700);

            Promise.resolve(getFetchPromise(reportId, severityList))
                .then((fetchedData) => {
                    const logReporter = buildLogReport(makeReport(fetchedData));
                    setSelectedReportId(reportId);
                    setLogs(logReporter.getAllLogs());
                    setHighlightedReportId(null);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'ReportFetchError',
                    });
                })
                .finally(() => {
                    clearTimeout(timer);
                    setWaitingLoadReport(false);
                });
        },
        [snackError, getFetchPromise, buildLogReport]
    );

    useEffect(() => {
        const reportType =
            jsonReportTree.message === GLOBAL_NODE_TASK_KEY ? LogReportType.GlobalReport : LogReportType.NodeReport;
        rootReport.current = new LogReport(reportType, jsonReportTree);
        let rootId = rootReport.current.id;
        treeView.current = createReporterItem(rootReport.current);
        setSelectedReportId(rootId);
        setExpandedTreeReports([rootId]);
        setLogs(rootReport.current.getAllLogs());
        setSelectedSeverity(LogReportItem.getDefaultSeverityFilter(rootReport.current.severityList));
    }, [jsonReportTree, createReporterItem]);

    const handleReportVerticalPositionFromTop = useCallback((node) => {
        setReportVerticalPositionFromTop(node?.getBoundingClientRect()?.top);
    }, []);

    const handleToggleNode = (event, nodeIds) => {
        event.persist();
        let iconClicked = event.target.closest('.MuiTreeItem-iconContainer');
        if (iconClicked) {
            setExpandedTreeReports(nodeIds);
        }
    };

    const handleSelectNode = (_, reportId) => {
        if (selectedReportId !== reportId) {
            const updatedSeverityList = LogReportItem.getDefaultSeverityFilter(
                reportTreeData.current[reportId].severityList
            );
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
            console.log(`row data ${JSON.stringify(data)}`);
            let treeReportsToExpand = [];
            let reportId = data.reportId;
            while (reportTreeData.current[reportId]?.parentReportId) {
                let parentReportId = reportTreeData.current[reportId].parentReportId;
                if (!previouslyExpandedTreeReports.includes(parentReportId)) {
                    treeReportsToExpand.push(parentReportId);
                }
                reportId = parentReportId;
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
        rootReport.current && (
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
                <Grid
                    item
                    xs={12}
                    sm={3}
                    sx={{
                        height: '100%',
                        overflow: 'auto',
                        borderRight: '1px solid rgba(81, 81, 81, 1)',
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
                        <TreeView
                            sx={styles.treeView}
                            defaultCollapseIcon={<ArrowDropDownIcon />}
                            defaultExpandIcon={<ArrowRightIcon />}
                            defaultEndIcon={<div style={{ width: 24 }} />}
                            onNodeToggle={handleToggleNode}
                            onNodeSelect={handleSelectNode}
                            selected={selectedReportId}
                            expanded={expandedTreeReports}
                        >
                            {treeView.current}
                        </TreeView>
                    </ReportTreeViewContext.Provider>
                </Grid>
                <Grid item xs={12} sm={9} sx={{ height: '100%' }}>
                    <WaitingLoader loading={waitingLoadReport} message={'loadingReport'}>
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
