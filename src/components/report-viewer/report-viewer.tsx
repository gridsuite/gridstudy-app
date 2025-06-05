/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import LogTable from './log-table';
import { mapReportsTree } from '../../utils/report/report-tree.mapper';
import { VirtualizedTreeview } from './virtualized-treeview';
import { ReportItem } from './treeview-item';
import {
    ComputingAndNetworkModificationType,
    Log,
    Report,
    ReportTree,
    ReportType,
    SelectedReportLog,
    SeverityLevel,
} from 'utils/report/report.type';
import { GLOBAL_REPORT_NODE_LABEL } from '../../utils/report/report.constant';
import { ImperativePanelGroupHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box, Theme } from '@mui/material';

const styles = {
    panelHandlerContainer: (theme: Theme) => ({
        borderRight: `1px solid ${theme.palette.divider}`,
        marginRight: theme.spacing(1),
    }),
};

type ReportViewerProps = {
    report: Report;
    reportType: ComputingAndNetworkModificationType;
    severities: SeverityLevel[] | undefined;
    resetFilters?: boolean;
};

const DEFAULT_CONTAINER_HEIGHT_OFFSET = 170; // The value 170px is fine, but leaves a gap below the report.

export default function ReportViewer({
    report,
    reportType,
    severities = [],
    resetFilters = false,
}: Readonly<ReportViewerProps>) {
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

    const reportTreeMap = useMemo(() => {
        const map: Record<string, ReportTree> = {};
        const mapReportsById = (item: ReportTree) => {
            map[item.id] = item;
            item.subReports.forEach((subReport) => mapReportsById(subReport));
        };
        mapReportsById(reportTree);
        return map;
    }, [reportTree]);

    useEffect(() => {
        setExpandedTreeReports([reportTree.id]);
        setSelectedReport({ id: reportTree.id, type: reportTreeMap[reportTree.id]?.type });
    }, [reportTree, reportTreeMap]);

    const handleReportVerticalPositionFromTop = useCallback((node: HTMLDivElement) => {
        setReportVerticalPositionFromTop(node?.getBoundingClientRect()?.top ?? DEFAULT_CONTAINER_HEIGHT_OFFSET);
    }, []);

    // We calculate the remaining height relative to the viewport and the top position of the report.
    const reportContainerHeight = useMemo(
        () => `calc(100vh - ${reportVerticalPositionFromTop}px)`,
        [reportVerticalPositionFromTop]
    );

    const onLogRowClick = useCallback(
        (data: Log | undefined) => {
            setExpandedTreeReports((previouslyExpandedTreeReports) => {
                let treeReportsToExpand = new Set(previouslyExpandedTreeReports);
                let parentId: string | null = data?.parentId ?? null;
                while (parentId && reportTreeMap[parentId]?.parentId) {
                    parentId = reportTreeMap[parentId].parentId;
                    if (parentId) {
                        treeReportsToExpand.add(parentId);
                    }
                }
                return Array.from(treeReportsToExpand);
            });
            setHighlightedReportId(data?.parentId);
        },
        [reportTreeMap]
    );

    const onFiltersChanged = useCallback(() => {
        setHighlightedReportId(undefined);
    }, [setHighlightedReportId]);

    const handleSelectedItem = useCallback(
        (report: ReportItem) => {
            setSelectedReport((prevSelectedReport) => {
                if (prevSelectedReport.id !== report.id) {
                    return { id: report.id, type: reportTreeMap[report.id].type };
                }
                return prevSelectedReport;
            });
            setHighlightedReportId(undefined);
        },
        [reportTreeMap]
    );

    // Ref for resizing
    const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

    // sizes in percent
    const LEFT_PANEL_MIN_SIZE = 15;
    const LEFT_PANEL_DEFAULT_SIZE = 25;
    const RIGHT_PANEL_MIN_SIZE = 50;

    return (
        <Box width={'100%'} ref={handleReportVerticalPositionFromTop} sx={{ height: reportContainerHeight }}>
            <PanelGroup direction="horizontal" ref={panelGroupRef}>
                <Panel id="treeview-panel" minSize={LEFT_PANEL_MIN_SIZE} defaultSize={LEFT_PANEL_DEFAULT_SIZE}>
                    <VirtualizedTreeview
                        expandedTreeReports={expandedTreeReports}
                        setExpandedTreeReports={setExpandedTreeReports}
                        selectedReportId={selectedReport.id}
                        reportTree={reportTree}
                        onSelectedItem={handleSelectedItem}
                        highlightedReportId={highlightedReportId}
                    />
                </Panel>
                <Box display="flex" alignItems="center" sx={styles.panelHandlerContainer}>
                    <PanelResizeHandle>
                        <DragIndicatorIcon fontSize="small" sx={{ padding: 0, margin: 0 }} />
                    </PanelResizeHandle>
                </Box>
                <Panel id="logtable-panel" minSize={RIGHT_PANEL_MIN_SIZE}>
                    <LogTable
                        selectedReport={selectedReport}
                        reportType={reportType}
                        severities={severities}
                        onRowClick={onLogRowClick}
                        onFiltersChanged={onFiltersChanged}
                        resetFilters={resetFilters}
                    />
                </Panel>
            </PanelGroup>
        </Box>
    );
}
