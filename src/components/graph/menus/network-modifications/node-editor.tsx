/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme } from '@mui/material/styles';
import NetworkModificationNodeEditor from './network-modification-node-editor';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { EditableTitle } from './editable-title';
import { useDispatch, useSelector } from 'react-redux';
import { setModificationsDrawerOpen } from '../../../../redux/actions';
import { updateTreeNode } from '../../../../services/study/tree-subtree';
import { Box } from '@mui/material';
import { AppState } from '../../../../redux/reducer';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';

const styles = {
    paper: (theme: Theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        elevation: 3,
        background: theme.networkModificationPanel.backgroundColor,
    }),
};

const NodeEditor = () => {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const closeModificationsDrawer = () => {
        dispatch(setModificationsDrawerOpen(false));
    };

    const changeNodeName = (newName: string) => {
        updateTreeNode(studyUuid, {
            id: currentTreeNode?.id,
            type: currentTreeNode?.type,
            name: newName,
        }).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'NodeUpdateError',
            });
        });
    };

    return (
        <Box sx={styles.paper}>
            <EditableTitle
                name={currentTreeNode?.data?.label ?? ''}
                onClose={closeModificationsDrawer}
                onChange={changeNodeName}
                showRootNetworkSelection={enableDeveloperMode}
            />
            <NetworkModificationNodeEditor />
        </Box>
    );
};

export default NodeEditor;
