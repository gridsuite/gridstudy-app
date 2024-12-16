/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ReactElement, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import LogTable from './log-table';
import ReportTreeViewContext from './report-tree-view-context';
import ReportItem from './report-item';
import { mapReportsTree } from '../../utils/report/report-tree.mapper';
import { useDispatch } from 'react-redux';
import ReportTree from './report-tree';
import { Report, ReportLog, ReportTree as ReportTreeType, ReportType } from 'utils/report/report.type';

// WARNING this file has been copied from commons-ui, and updated here. Putting it back to commons-ui has to be discussed.

const styles = {
    treeItem: {
        whiteSpace: 'nowrap',
    },
};

type ReportViewerProps = { report: Report; reportType: string };

export default function ReportViewer({ report, reportType }: ReportViewerProps) {
    const dispatch = useDispatch();

    const [expandedTreeReports, setExpandedTreeReports] = useState<string[]>([]);
    const [highlightedReportId, setHighlightedReportId] = useState<string>();
    const [reportVerticalPositionFromTop, setReportVerticalPositionFromTop] = useState<number | undefined>(undefined);

    const [selectedReportId, setSelectedReportId] = useState(report?.id);
    const [selectedReportType, setSelectedReportType] = useState<ReportType>();

    const reportTreeData = useRef<Record<string, ReportTreeType>>({});
    const treeView = useRef<ReactElement>();

    /**
     * Build the tree view (left pane) creating all ReportItem from json data
     * @type {Function}
     */
    const initializeTreeDataAndComponent = useCallback((report: ReportTreeType) => {
        reportTreeData.current[report.id] = report;
        return (
            <ReportItem
                labelText={report.message}
                labelIconColor={report.severity.colorName}
                key={report.id}
                sx={styles.treeItem}
                nodeId={report.id}
            >
                {report.subReports.map((value: ReportTreeType) => initializeTreeDataAndComponent(value))}
            </ReportItem>
        );
    }, []);

    useEffect(() => {
        const reportTree = mapReportsTree(report);
        treeView.current = initializeTreeDataAndComponent(reportTree);
        setExpandedTreeReports([report.id]);
        setSelectedReportId(report.id);
        setSelectedReportType(reportTreeData.current[report.id]?.type);
    }, [report, initializeTreeDataAndComponent, dispatch]);

    const handleReportVerticalPositionFromTop = useCallback((node: HTMLDivElement) => {
        setReportVerticalPositionFromTop(node?.getBoundingClientRect()?.top);
    }, []);

    const handleSelectNode = (_: SyntheticEvent, reportId: string) => {
        if (selectedReportId !== reportId) {
            setSelectedReportId(reportId);
            setSelectedReportType(reportTreeData.current[reportId].type);
        }
    };

    // The MUI TreeView/TreeItems use useMemo on our items, so it's important to avoid changing the context
    const isHighlighted = useMemo(
        () => ({
            isHighlighted: (reportId: string) => highlightedReportId === reportId,
        }),
        [highlightedReportId]
    );

    const onLogRowClick = (data: ReportLog) => {
        setExpandedTreeReports((previouslyExpandedTreeReports) => {
            let treeReportsToExpand = new Set(previouslyExpandedTreeReports);
            let parentId = data.parentId;
            while (reportTreeData.current[parentId]?.parentId) {
                parentId = reportTreeData.current[parentId].parentId as string;
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
                    {selectedReportId && selectedReportType && (
                        <LogTable
                            report={report}
                            selectedReportId={selectedReportId}
                            reportType={reportType}
                            reportNature={selectedReportType} // GlobalReport or NodeReport
                            onRowClick={onLogRowClick}
                        />
                    )}
                </Grid>
            </Grid>
        )
    );
}
