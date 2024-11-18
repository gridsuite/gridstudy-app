/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren, SyntheticEvent } from 'react';
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
    expandedTreeReports: string[];
    setExpandedTreeReports: (reeReportsIds: string[]) => void;
    handleSelectNode: (event: SyntheticEvent, reportId: string) => void;
}

const ReportTree: React.FC<PropsWithChildren<ReportTreeProps>> = ({
    selectedReportId,
    expandedTreeReports,
    setExpandedTreeReports,
    handleSelectNode,
    children,
}) => {
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
                {children}
            </TreeView>
        </Grid>
    );
};

export default ReportTree;
