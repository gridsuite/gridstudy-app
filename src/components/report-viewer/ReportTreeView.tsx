import { TreeView, TreeViewProps } from '@mui/x-tree-view/TreeView';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { ReportTree } from './ReportTree';
import React, { MutableRefObject, SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { ReportTree as ReportTreeData } from './reportTreeMapper';
import ReportTreeViewContext from './report-tree-view-context';
import { Grid } from '@mui/material';

const styles = {
    treeView: {
        height: '100%',
    },
};

interface ReportTreeViewProps {
    selectedReportId: string;
    highlightedReportId: string;
    onSelectReport: TreeViewProps<false>['onNodeSelect'];
    report: ReportTreeData;
    reportTreeMapRef: MutableRefObject<Record<string, ReportTreeData>>;
}

export const ReportTreeView = ({
    selectedReportId,
    report,
    onSelectReport,
    highlightedReportId,
    reportTreeMapRef,
}: ReportTreeViewProps) => {
    const [expandedTreeReports, setExpandedTreeReports] = useState<string[]>([report.id]);

    // The MUI TreeView/TreeItems use useMemo on our items, so it's important to avoid changing the context
    const isHighlighted = useMemo(() => (reportId: string) => highlightedReportId === reportId, [highlightedReportId]);

    const handleToggleNode = (event: SyntheticEvent, reportIds: string[]) => {
        event.persist();
        //@ts-ignore
        let iconClicked = event.target.closest('.MuiTreeItem-iconContainer');
        if (iconClicked) {
            setExpandedTreeReports(reportIds);
        }
    };

    // console.log(`tree report ${JSON.stringify(report)}`);
    //
    // console.log(`expanded tree reports ${JSON.stringify(expandedTreeReports)}`);

    useEffect(() => {
        setExpandedTreeReports((previouslyExpandedTreeReports) => {
            let treeReportsToExpand = [];
            let reportId: string | undefined = highlightedReportId;
            if (!highlightedReportId) {
                return [report.id];
            }
            while (reportId && reportTreeMapRef.current[reportId]?.parentReportId) {
                let parentReportId: string | undefined = reportTreeMapRef.current[reportId].parentReportId;
                if (parentReportId && !previouslyExpandedTreeReports.includes(parentReportId)) {
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
    }, [highlightedReportId, report.id, reportTreeMapRef]);

    console.log(`rendering report tree view`);

    return (
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
                    onNodeSelect={onSelectReport}
                    selected={selectedReportId}
                    expanded={expandedTreeReports}
                >
                    <ReportTree report={report} />
                </TreeView>
            </ReportTreeViewContext.Provider>
        </Grid>
    );
};
