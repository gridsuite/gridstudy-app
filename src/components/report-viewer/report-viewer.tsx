/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Box } from '@mui/material';
import { type MuiStyles } from '@gridsuite/commons-ui';

const styles = {
    panelHandlerContainer: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        borderRight: `1px solid ${theme.palette.divider}`,
    }),
} as const satisfies MuiStyles;

type ReportViewerProps = {
    report: Report;
    reportType: ComputingAndNetworkModificationType;
    severities: SeverityLevel[] | undefined;
    resetFilters?: boolean;
};

export default function ReportViewer({
    report,
    reportType,
    severities = [],
    resetFilters = false,
}: Readonly<ReportViewerProps>) {
    const [expandedTreeReports, setExpandedTreeReports] = useState<string[]>([]);
    const [highlightedReportId, setHighlightedReportId] = useState<string>();

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
        const newType = reportTreeMap[reportTree.id]?.type;
        setSelectedReport((currentSelected) => {
            if (currentSelected.id !== reportTree.id || currentSelected.type !== newType) {
                setExpandedTreeReports([reportTree.id]);
                return { id: reportTree.id, type: newType };
            }
            return currentSelected;
        });
    }, [reportTree, reportTreeMap]);

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
            <Box sx={styles.panelHandlerContainer}>
                <PanelResizeHandle>
                    <DragIndicatorIcon fontSize="small" />
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
    );
}
