/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { PropsWithChildren, SyntheticEvent } from 'react';
import { Box, Grid } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { RichTreeView } from '@mui/x-tree-view';

const styles = {
    treeView: {
        height: '100%',
    },
};

interface ReportTreeProps {
    selectedReportId: string;
    expandedTreeReports: string[];
    setExpandedTreeReports: (reeReportsIds: string[]) => void;
    handleSelectNode: (event: SyntheticEvent, reportId: string | null) => void;
    items: any;
}

const ReportTree: React.FC<PropsWithChildren<ReportTreeProps>> = ({
    selectedReportId,
    expandedTreeReports,
    setExpandedTreeReports,
    handleSelectNode,
    items,
}) => {
    const EndIcon = function () {
        return <Box style={{ width: 24 }} />;
    };

    const handleToggleNode = (event: SyntheticEvent, nodeIds: string[]) => {
        event.persist();
        //@ts-ignore
        let iconClicked = event.target.closest('.MuiTreeItem-iconContainer');
        if (iconClicked) {
            setExpandedTreeReports(nodeIds.filter((nodeId) => nodeId !== undefined));
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
            <RichTreeView
                sx={styles.treeView}
                onExpandedItemsChange={handleToggleNode}
                onItemClick={handleSelectNode}
                selectedItems={selectedReportId}
                expandedItems={expandedTreeReports}
                slots={{ collapseIcon: ArrowDropDownIcon, expandIcon: ArrowRightIcon, endIcon: EndIcon }}
                items={[items]}
            />
        </Grid>
    );
};

export default ReportTree;
