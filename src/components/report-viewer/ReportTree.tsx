import React, { MutableRefObject, ReactNode, SyntheticEvent } from 'react';
import { Grid } from '@mui/material';
import { TreeView } from '@mui/x-tree-view/TreeView';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const styles = {
    treeView: {
        height: '100%',
    },
};

interface ReportTreeProps {
    selectedReportId: string;
    treeView: MutableRefObject<ReactNode>;
    expandedTreeReports: string[];
    setExpandedTreeReports: (reeReportsIds: string[]) => void;
    handleSelectNode: (event: SyntheticEvent, reportId: string) => void;
}

export const ReportTree = ({
    selectedReportId,
    treeView,
    expandedTreeReports,
    setExpandedTreeReports,
    handleSelectNode,
}: ReportTreeProps) => {
    const handleToggleNode = (event: SyntheticEvent, nodeIds: string[]) => {
        event.persist();
        //@ts-ignore
        let iconClicked = event.target.closest('.MuiTreeItem-iconContainer');
        if (iconClicked) {
            setExpandedTreeReports(nodeIds);
        }
    };

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
            {/*TODO do we need to useMemo/useCallback these props to avoid rerenders ?*/}
            <TreeView
                sx={styles.treeView}
                defaultCollapseIcon={<ArrowDropDownIcon />}
                defaultExpandIcon={<ArrowRightIcon />}
                defaultEndIcon={<div style={{ width: 24 }} />}
                onNodeToggle={handleToggleNode}
                onNodeSelect={handleSelectNode}
                selected={selectedReportId}
                expanded={expandedTreeReports}
            >
                {treeView.current}
            </TreeView>
        </Grid>
    );
};
