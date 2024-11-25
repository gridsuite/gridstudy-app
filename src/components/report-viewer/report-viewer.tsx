/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import LogTable from './log-table';
import { mapReportsTree } from '../../utils/report/report-tree.mapper';
import { useDispatch } from 'react-redux';
import { Report, ReportLog, ReportTree as ReportTreeType, ReportType } from 'utils/report/report.type';
import { VirtualizedTreeView } from '../custom-treeview/VirtualizedTreeView';
import Label from '@mui/icons-material/Label';
import { ReportItem } from '../custom-treeview/TreeViewItem';
import { Theme } from '@mui/system';

const styles = {
    treeItem: {
        whiteSpace: 'nowrap',
    },
    labelIcon: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
};

type ReportViewerProps = { report: Report; reportType: string };

export default function ReportViewer({ report, reportType }: ReportViewerProps) {
    const dispatch = useDispatch();

    const [expandedTreeReports, setExpandedTreeReports] = useState<string[]>([]);
    const [highlightedReportId, setHighlightedReportId] = useState<string>();
    const [reportVerticalPositionFromTop, setReportVerticalPositionFromTop] = useState<number | undefined>(undefined);

    const [selectedReportId, setSelectedReportId] = useState(report?.id);
    const [severities, setSeverities] = useState<string[]>([]);
    const [selectedReportType, setSelectedReportType] = useState<ReportType>();

    const reportTreeData = useRef<Record<string, ReportTreeType>>({});
    const treeView = useRef<ReportItem[]>();

    const toTreeNodes = useCallback(
        (item: ReportTreeType, depth: number): ReportItem[] => {
            const result: ReportItem[] = [];
            const collapsed = !expandedTreeReports.includes(item.id);
            if (item.id) {
                reportTreeData.current[item.id] = item;
                result.push({
                    collapsed: collapsed,
                    depth: depth,
                    label: item.message,
                    id: item.id,
                    isLeaf: !item.subReports.find((subReports) => subReports.id !== null),
                    icon: <Label htmlColor={item.highestSeverity.colorName} sx={styles.labelIcon} />,
                    isSelected: item.id === selectedReportId,
                });
                if (item.subReports.length > 0 && !collapsed) {
                    for (let subReports of item.subReports) {
                        result.push(...toTreeNodes(subReports, depth + 1));
                    }
                }
            }
            return result;
        },
        [expandedTreeReports, selectedReportId]
    );

    useEffect(() => {
        const reportTree = mapReportsTree(report);
        setExpandedTreeReports([report.id]);
        setSelectedReportId(report.id);
        setSeverities([...new Set(reportTree.severities)]);
        setSelectedReportType(reportTreeData.current[report.id]?.type);
    }, [report, dispatch]);

    treeView.current = toTreeNodes(mapReportsTree(report), 0);

    const handleReportVerticalPositionFromTop = useCallback((node: HTMLDivElement) => {
        setReportVerticalPositionFromTop(node?.getBoundingClientRect()?.top);
    }, []);

    // The MUI VirtualizedTreeView/TreeItems use useMemo on our items, so it's important to avoid changing the context
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
                    TreeItems) wouldn't work since VirtualizedTreeView children are
                    memoized and would then be rerendered only when VirtualizedTreeView is
                    rerendered. That's why we pass the isHighlighted callback in
                    a new context, to which all children subscribe and as soon
                    as the context is modified, children will be rerendered
                    accordingly */}
                {/*<ReportTreeViewContext.Provider value={isHighlighted}>
                    TODO do we need to useMemo/useCallback these props to avoid rerenders ?
                    <ReportTree
                        selectedReportId={selectedReportId}
                        expandedTreeReports={expandedTreeReports}
                        setExpandedTreeReports={setExpandedTreeReports}
                        handleSelectNode={handleSelectNode}
                    >
                        {treeView.current}
                    </ReportTree>
                </ReportTreeViewContext.Provider>*/}
                <Grid item sm={3}>
                    <Fragment>
                        {treeView.current && (
                            <VirtualizedTreeView
                                nodes={treeView.current}
                                itemSize={32}
                                style={styles.treeItem}
                                onSelectedItem={(report: ReportItem) => {
                                    if (selectedReportId !== report.id) {
                                        setSelectedReportId(report.id);
                                        setSeverities([...new Set(reportTreeData.current[report.id].severities)]);
                                        setSelectedReportType(reportTreeData.current[report.id].type);
                                    }
                                }}
                                onExpandItem={(node: ReportItem) => {
                                    if (node.collapsed) {
                                        return setExpandedTreeReports([...expandedTreeReports, node.id]);
                                    } else {
                                        return setExpandedTreeReports(
                                            expandedTreeReports.filter((id) => id !== node.id)
                                        );
                                    }
                                }}
                            />
                        )}
                    </Fragment>
                </Grid>
                <Grid item xs={12} sm={9}>
                    {selectedReportId && selectedReportType && (
                        <LogTable
                            selectedReportId={selectedReportId}
                            reportType={reportType}
                            reportNature={selectedReportType} // GlobalReport or NodeReport
                            severities={severities}
                            onRowClick={onLogRowClick}
                        />
                    )}
                </Grid>
            </Grid>
        )
    );
}
