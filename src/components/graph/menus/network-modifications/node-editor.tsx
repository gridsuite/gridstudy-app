/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import NetworkModificationNodeEditor from './network-modification-node-editor';
import { ComputingType, type MuiStyles } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { AppState } from '../../../../redux/reducer.type';
import RunningStatus from 'components/utils/running-status';
import { NodeEditorHeader } from './node-editor-header';
import { isSecurityModificationNode } from '../../tree-node.type';
import { LoadflowModificationAlert } from './loadflow-modifications/loadflow-modification-alert';
import { memo } from 'react';

const styles = {
    paper: (theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        elevation: 3,
        background: theme.palette.background.paper,
    }),
} as const satisfies MuiStyles;

const NodeEditor = memo(() => {
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    return (
        <Box sx={styles.paper}>
            <NodeEditorHeader />

            <NetworkModificationNodeEditor />
            {loadFlowStatus === RunningStatus.SUCCEED && isSecurityModificationNode(currentTreeNode) && (
                <LoadflowModificationAlert />
            )}
        </Box>
    );
});

export default NodeEditor;
