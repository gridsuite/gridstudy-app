/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import TreeView from '@mui/lab/TreeView';
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
        overflow: 'scroll',
    },
    treeItem: {
        whiteSpace: 'nowrap',
    },
};

export default function ReportViewer({
    jsonReportTree,
    visible,
    reporterElementsPromise,
    nodeElementsPromise,
    allLogsElementsPromise,
    maxSubReports = MAX_SUB_REPORTS,
}) {
    const [selectedNode, setSelectedNode] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState([]);
    const [logs, setLogs] = useState(null);
    const [waitingLoadReport, setWaitingLoadReport] = useState(false);
    const { snackError } = useSnackMessage();

    const [highlightedReportId, setHighlightedReportId] = useState();

    const rootReport = useRef(null);
    const reportTreeData = useRef({});
    const treeView = useRef(null);

    const [selectedSeverity, setSelectedSeverity] = useState(
        LogReportItem.getDefaultSeverityFilter()
    );

    /**
     * Build the tree view (left pane) creating all ReportItem from json data
     * @type {Function}
     */
    const createReporterItem = useCallback(
        (logReport) => {
            reportTreeData.current[logReport.getNodeId()] = logReport;
            if (logReport.getSubReports().length > maxSubReports) {
                console.warn(
                    'The number (%s) being greater than %s only the first %s subreports will be displayed',
                    logReport.getSubReports().length,
                    maxSubReports,
                    maxSubReports
                );
            }
            return (
                <ReportItem
                    labelText={logReport.getTitle()}
                    labelIconColor={logReport.getHighestSeverity().colorName}
                    key={logReport.getNodeId().toString()}
                    sx={styles.treeItem}
                    nodeId={logReport.getNodeId().toString()}
                >
                    {logReport
                        .getSubReports()
                        .slice(0, maxSubReports)
                        .map((value) => createReporterItem(value))}
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
            } else {
                return {
                    taskKey: GLOBAL_NODE_TASK_KEY,
                    defaultName: GLOBAL_NODE_TASK_KEY,
                    reports: [],
                    subReporters: reportData,
                };
            }
        }
    };

    const getFetchPromise = useCallback(
        (nodeId, severityList) => {
            if (
                reportTreeData.current[nodeId].getType() ===
                LogReportType.NodeReport
            ) {
                return nodeElementsPromise(
                    reportTreeData.current[nodeId].getKey(),
                    reportTreeData.current[nodeId].getId(),
                    severityList
                );
            } else if (
                reportTreeData.current[nodeId].getType() ===
                LogReportType.GlobalReport
            ) {
                return allLogsElementsPromise(severityList);
            } else {
                // SubReport
                return reporterElementsPromise(nodeId, severityList);
            }
        },
        [nodeElementsPromise, allLogsElementsPromise, reporterElementsPromise]
    );

    const buildLogReport = useCallback((jsonData) => {
        return jsonData.taskKey === GLOBAL_NODE_TASK_KEY
            ? new LogReport(LogReportType.GlobalReport, jsonData)
            : new LogReport(LogReportType.NodeReport, jsonData);
    }, []);

    const refreshNode = useCallback(
        (nodeId, severityFilter) => {
            if (
                reportTreeData.current[nodeId].getType() ===
                    LogReportType.NodeReport &&
                !reportTreeData.current[nodeId].getId()
            ) {
                // can happen where no logs / no direct access => cannot fetch data
                return;
            }

            let severityList = [];
            for (const [severity, selected] of Object.entries(severityFilter)) {
                if (selected) {
                    severityList.push(severity);
                }
            }

            // use a timout to avoid having a loader in case of fast promise return (avoid blink)
            const timer = setTimeout(() => {
                setWaitingLoadReport(true);
            }, 700);

            Promise.resolve(getFetchPromise(nodeId, severityList))
                .then((fetchedData) => {
                    clearTimeout(timer);
                    const logReporter = buildLogReport(makeReport(fetchedData));
                    setSelectedNode(nodeId);
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
        if (visible && rootReport.current === null) {
            rootReport.current = buildLogReport(jsonReportTree);
            let rootId = rootReport.current.getNodeId().toString();
            treeView.current = createReporterItem(rootReport.current);
            setSelectedNode(rootId);
            setExpandedNodes([rootId]);
            refreshNode(rootId, LogReportItem.getDefaultSeverityFilter());
        }
    }, [
        jsonReportTree,
        createReporterItem,
        refreshNode,
        visible,
        buildLogReport,
    ]);

    const handleToggleNode = (event, nodeIds) => {
        event.persist();
        let iconClicked = event.target.closest('.MuiTreeItem-iconContainer');
        if (iconClicked) {
            setExpandedNodes(nodeIds);
        }
    };

    const handleSelectNode = (event, nodeId) => {
        selectNode(nodeId);
    };

    const selectNode = (nodeId) => {
        if (selectedNode !== nodeId) {
            refreshNode(nodeId, selectedSeverity);
        }
    };

    const onSeverityChange = (newSeverityFilter) => {
        refreshNode(selectedNode, newSeverityFilter);
        setSelectedSeverity(newSeverityFilter);
    };

    // The MUI TreeView/TreeItems use useMemo on our items, so it's important to avoid changing the context
    const isHighlighted = useMemo(
        () => ({
            isHighlighted: (reportId) => highlightedReportId === reportId,
        }),
        [highlightedReportId]
    );

    const onRowClick = (data) => {
        setExpandedNodes((previouslyExpandedNodes) => {
            let nodesToExpand = [];
            let reportId = data.reportId;
            while (reportTreeData.current[reportId]?.parentReportId) {
                let parentReportId =
                    reportTreeData.current[reportId].parentReportId;
                if (!previouslyExpandedNodes.includes(parentReportId)) {
                    nodesToExpand.push(parentReportId);
                }
                reportId = parentReportId;
            }
            if (nodesToExpand.length > 0) {
                return nodesToExpand.concat(previouslyExpandedNodes);
            } else {
                return previouslyExpandedNodes;
            }
        });
        setHighlightedReportId(data.reportId);
    };

    return (
        rootReport.current && (
            <Grid container style={{ height: '100%' }}>
                <Grid
                    item
                    xs={12}
                    sm={3}
                    style={{
                        height: '95%',
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
                            selected={selectedNode}
                            expanded={expandedNodes}
                        >
                            {treeView.current}
                        </TreeView>
                    </ReportTreeViewContext.Provider>
                </Grid>
                <Grid item xs={12} sm={9} style={{ height: '95%' }}>
                    <WaitingLoader
                        loading={waitingLoadReport}
                        message={'loadingReport'}
                    >
                        <LogTable
                            logs={logs}
                            onRowClick={onRowClick}
                            selectedSeverity={selectedSeverity}
                            setSelectedSeverity={onSeverityChange}
                        />
                    </WaitingLoader>
                </Grid>
            </Grid>
        )
    );
}
