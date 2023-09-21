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
import LogReport from './log-report';
import Grid from '@mui/material/Grid';
import LogTable from './log-table';
import ReportTreeViewContext from './report-tree-view-context';
import LogReportItem from './log-report-item';

const MAX_SUB_REPORTS = 500;

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
    jsonReport,
    maxSubReports = MAX_SUB_REPORTS,
}) {
    const [selectedNode, setSelectedNode] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState([]);
    const [logs, setLogs] = useState(null);

    const [highlightedReportId, setHighlightedReportId] = useState();

    const rootReport = useRef(null);
    const allReports = useRef({});
    const treeView = useRef(null);

    const defaultSeverityFilter = useMemo(() => {
        const filterConfig = {};
        Object.values(LogReportItem.SEVERITY).forEach((severity) => {
            // by default display only INFO severity and higher
            filterConfig[severity.name] =
                severity.level >= LogReportItem.SEVERITY.INFO.level;
        });
        return filterConfig;
    }, []);

    const [selectedSeverity, setSelectedSeverity] = useState(
        defaultSeverityFilter
    );

    const createReporterItem = useCallback(
        (logReport) => {
            allReports.current[logReport.getId()] = logReport;
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
                    key={logReport.getId().toString()}
                    sx={styles.treeItem}
                    nodeId={logReport.getId().toString()}
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

    useEffect(() => {
        rootReport.current = new LogReport(jsonReport);
        let rootId = rootReport.current.getId().toString();
        treeView.current = createReporterItem(rootReport.current);
        setSelectedNode(rootId);
        setExpandedNodes([rootId]);
        setLogs(rootReport.current.getAllLogs());
    }, [jsonReport, createReporterItem]);

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
            setSelectedNode(nodeId);
            setLogs(allReports.current[nodeId].getAllLogs());
            setHighlightedReportId(null);
        }
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
            while (allReports.current[reportId]?.parentReportId) {
                let parentReportId =
                    allReports.current[reportId].parentReportId;
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
                    <LogTable
                        logs={logs}
                        onRowClick={onRowClick}
                        selectedSeverity={selectedSeverity}
                        setSelectedSeverity={setSelectedSeverity}
                    />
                </Grid>
            </Grid>
        )
    );
}
