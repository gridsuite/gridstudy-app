/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import LogTable from './log-table';
import { mapReportsTree } from '../../utils/report/report-tree.mapper';
import { useDispatch } from 'react-redux';
import { Report, ReportLog, ReportTree as ReportTreeType, ReportType } from 'utils/report/report.type';
import { VirtualizedTreeview } from '../custom-treeview/virtualized-treeview';
import Label from '@mui/icons-material/Label';
import { ReportItem } from '../custom-treeview/treeview-item';
import { Theme } from '@mui/system';
import { FixedSizeList } from 'react-window';
import { useTreeViewScroll } from '../custom-treeview/use-treeview-scroll';

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
    const listRef = useRef<FixedSizeList>(null);

    const toTreeNodes = useCallback(
        (item: ReportTreeType, depth: number, parentId?: string): ReportItem[] => {
            const result: ReportItem[] = [];
            const collapsed = !expandedTreeReports.includes(item.id);
            if (item.id) {
                reportTreeData.current[item.id] = item;
                result.push({
                    collapsed: collapsed,
                    depth: depth,
                    label: item.message,
                    id: item.id,
                    parentId: parentId,
                    isLeaf: !item.subReports.find((subReports) => subReports.id !== null),
                    icon: <Label htmlColor={item.highestSeverity.colorName} sx={styles.labelIcon} />,
                    isSelected: item.id === selectedReportId,
                    isDisplayed: (parentId && expandedTreeReports.includes(parentId)) || depth === 0,
                });
                if (item.subReports.length > 0) {
                    for (let subReports of item.subReports) {
                        result.push(...toTreeNodes(subReports, depth + 1, item.id));
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

    const handleReportVerticalPositionFromTop = useCallback((node: HTMLDivElement) => {
        setReportVerticalPositionFromTop(node?.getBoundingClientRect()?.top);
    }, []);

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

    const handleSelectedItem = useCallback(
        (report: ReportItem) => {
            if (selectedReportId !== report.id) {
                setSelectedReportId(report.id);
                setSeverities([...new Set(reportTreeData.current[report.id].severities)]);
                setSelectedReportType(reportTreeData.current[report.id].type);
            }
        },
        [selectedReportId]
    );

    const handleExpandItem = useCallback(
        (node: ReportItem) => {
            if (node.collapsed) {
                return setExpandedTreeReports([...expandedTreeReports, node.id]);
            } else {
                return setExpandedTreeReports(expandedTreeReports.filter((id) => id !== node.id));
            }
        },
        [expandedTreeReports]
    );

    treeView.current = toTreeNodes(mapReportsTree(report), 0);
    const areParentsExpanded = useCallback((node: ReportItem): boolean => {
        if (node.parentId) {
            const parent = treeView.current?.find((nodeParent) => nodeParent.id === node.parentId);
            if (!parent) {
                return true;
            }
            return parent.isDisplayed && areParentsExpanded(parent);
        } else {
            return true;
        }
    }, []);
    const reportsToDisplay = treeView.current?.filter((node) => node.isDisplayed && areParentsExpanded(node)) ?? [];
    useTreeViewScroll(highlightedReportId, reportsToDisplay, listRef);

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
                <Grid item sm={3}>
                    <Fragment>
                        {treeView.current && (
                            <VirtualizedTreeview
                                listRef={listRef}
                                nodes={reportsToDisplay}
                                itemSize={32}
                                style={styles.treeItem}
                                onSelectedItem={handleSelectedItem}
                                onExpandItem={handleExpandItem}
                                highlightedReportId={highlightedReportId ?? ''}
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
