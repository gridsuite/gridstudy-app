/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import LogTable from './log-table';
import { mapReportsTree } from '../../utils/report/report-tree.mapper';
import { VirtualizedTreeview } from './virtualized-treeview';
import { ReportItem } from './treeview-item';
import { Report, ReportLog, ReportTree, ReportType, SelectedReportLog, SeverityLevel } from 'utils/report/report.type';
import { GLOBAL_REPORT_NODE_LABEL } from '../../utils/report/report.constant';

type ReportViewerProps = { report: Report; reportType: string; severities: SeverityLevel[] | undefined };

const DEFAULT_CONTAINER_HEIGHT_OFFSET = 170; // The value 170px is fine, but leaves a gap below the report.

export default function ReportViewer({ report, reportType, severities = [] }: ReportViewerProps) {
    const [expandedTreeReports, setExpandedTreeReports] = useState<string[]>([]);
    const [highlightedReportId, setHighlightedReportId] = useState<string>();
    const [reportVerticalPositionFromTop, setReportVerticalPositionFromTop] = useState<number>(
        DEFAULT_CONTAINER_HEIGHT_OFFSET
    );

    const [selectedReport, setSelectedReport] = useState<SelectedReportLog>({
        id: report.id,
        type: report.message === GLOBAL_REPORT_NODE_LABEL ? ReportType.GLOBAL : ReportType.NODE,
    });

    const reportTree = useMemo(() => mapReportsTree(report), [report]);
    const reportTreeMap = useRef<Record<string, ReportTree>>({});

    const computeReportTreeMap = useCallback(() => {
        reportTreeMap.current = {};
        const mapReportsById = (item: ReportTree) => {
            reportTreeMap.current[item.id] = item;
            for (let subReport of item.subReports) {
                mapReportsById(subReport);
            }
        };
        mapReportsById(reportTree);
    }, [reportTree]);

    useEffect(() => {
        computeReportTreeMap();
        setExpandedTreeReports([reportTree.id]);
        setSelectedReport({ id: reportTree.id, type: reportTreeMap.current[reportTree.id]?.type });
    }, [computeReportTreeMap, reportTree]);

    const handleReportVerticalPositionFromTop = useCallback((node: HTMLDivElement) => {
        setReportVerticalPositionFromTop(node?.getBoundingClientRect()?.top ?? DEFAULT_CONTAINER_HEIGHT_OFFSET);
    }, []);

    // We calculate the remaining height relative to the viewport and the top position of the report.
    const reportContainerHeight = useMemo(
        () => `calc(100vh - ${reportVerticalPositionFromTop}px)`,
        [reportVerticalPositionFromTop]
    );

    const onLogRowClick = useCallback((data: ReportLog) => {
        setExpandedTreeReports((previouslyExpandedTreeReports) => {
            let treeReportsToExpand = new Set(previouslyExpandedTreeReports);
            let parentId: string | null = data.parentId;
            while (parentId && reportTreeMap.current[parentId]?.parentId) {
                if ((parentId = reportTreeMap.current[parentId].parentId)) {
                    treeReportsToExpand.add(parentId);
                }
            }
            return Array.from(treeReportsToExpand);
        });
        setHighlightedReportId(data.parentId);
    }, []);

    const handleSelectedItem = useCallback((report: ReportItem) => {
        setSelectedReport((prevSelectedReport) => {
            if (prevSelectedReport.id !== report.id) {
                return { id: report.id, type: reportTreeMap.current[report.id].type };
            }
            return prevSelectedReport;
        });
    }, []);

    return (
        <Grid
            container
            ref={handleReportVerticalPositionFromTop}
            sx={{
                height: reportContainerHeight,
            }}
        >
            <Grid item sm={3} sx={{ borderRight: (theme) => `1px solid ${theme.palette.divider}` }}>
                {reportTree && (
                    <VirtualizedTreeview
                        expandedTreeReports={expandedTreeReports}
                        setExpandedTreeReports={setExpandedTreeReports}
                        selectedReportId={selectedReport.id}
                        reportTree={reportTree}
                        onSelectedItem={handleSelectedItem}
                        highlightedReportId={highlightedReportId}
                    />
                )}
            </Grid>
            <Grid item xs={12} sm={9}>
                {selectedReport.id && selectedReport.type && (
                    <LogTable
                        selectedReport={selectedReport}
                        reportType={reportType}
                        severities={severities}
                        onRowClick={onLogRowClick}
                    />
                )}
            </Grid>
        </Grid>
    );
}
