/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import LogTable from './log-table';
import { mapReportsTree } from '../../utils/report/report-tree.mapper';
import { VirtualizedTreeview } from './virtualized-treeview';
import { ReportItem } from './treeview-item';
import { Report, ReportLog, ReportTree, ReportType, SeverityLevel } from 'utils/report/report.type';

type ReportViewerProps = { report: Report; reportType: string; severities: SeverityLevel[] | undefined };

export default function ReportViewer({ report, reportType, severities }: ReportViewerProps) {
    const [expandedTreeReports, setExpandedTreeReports] = useState<string[]>([]);
    const [highlightedReportId, setHighlightedReportId] = useState<string>();
    const [reportVerticalPositionFromTop, setReportVerticalPositionFromTop] = useState<number | undefined>(undefined);

    const [selectedReportId, setSelectedReportId] = useState(report?.id);
    const [selectedReportType, setSelectedReportType] = useState<ReportType>();

    const reportTree = useMemo(() => mapReportsTree(report), [report]);

    const reportTreeMap = useMemo(() => {
        const map: Record<string, ReportTree> = {};
        const mapReports = (item: ReportTree) => {
            map[item.id] = item;
            for (let subReport of item.subReports) {
                mapReports(subReport);
            }
        };
        mapReports(reportTree);
        return map;
    }, [reportTree]);

    useEffect(() => {
        setExpandedTreeReports([reportTree.id]);
        setSelectedReportId(reportTree.id);
        setSelectedReportType(reportTreeMap[reportTree.id]?.type);
    }, [reportTree, reportTreeMap]);

    const handleReportVerticalPositionFromTop = useCallback((node: HTMLDivElement) => {
        setReportVerticalPositionFromTop(node?.getBoundingClientRect()?.top);
    }, []);

    const onLogRowClick = useCallback(
        (data: ReportLog) => {
            setExpandedTreeReports((previouslyExpandedTreeReports) => {
                let treeReportsToExpand = new Set(previouslyExpandedTreeReports);
                let parentId = data.parentId;
                while (reportTreeMap[parentId]?.parentId) {
                    parentId = reportTreeMap[parentId].parentId as string;
                    treeReportsToExpand.add(parentId);
                }
                return Array.from(treeReportsToExpand);
            });
            setHighlightedReportId(data.parentId);
        },
        [reportTreeMap]
    );

    const handleSelectedItem = useCallback(
        (report: ReportItem) => {
            setSelectedReportId((prevSelectedReportId) => {
                if (prevSelectedReportId !== report.id) {
                    setSelectedReportType(reportTreeMap[report.id].type);
                    return report.id;
                }
                return prevSelectedReportId;
            });
        },
        [reportTreeMap]
    );

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
                <Grid item sm={3} sx={{ borderRight: (theme) => `1px solid ${theme.palette.divider}` }}>
                    {reportTree && (
                        <VirtualizedTreeview
                            expandedTreeReports={expandedTreeReports}
                            setExpandedTreeReports={setExpandedTreeReports}
                            selectedReportId={selectedReportId}
                            reportTree={reportTree}
                            onSelectedItem={handleSelectedItem}
                            highlightedReportId={highlightedReportId}
                        />
                    )}
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
