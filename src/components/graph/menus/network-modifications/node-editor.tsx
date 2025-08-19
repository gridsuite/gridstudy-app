/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme } from '@mui/material/styles';
import NetworkModificationNodeEditor from './network-modification-node-editor';
import { ComputingType, useSnackMessage } from '@gridsuite/commons-ui';
import { EditableTitle } from './editable-title';
import { useDispatch, useSelector } from 'react-redux';
import { setToggleOptions } from '../../../../redux/actions';
import { updateTreeNode } from '../../../../services/study/tree-subtree';
import { Box } from '@mui/material';
import { AppState } from '../../../../redux/reducer';
import RunningStatus from 'components/utils/running-status';
import { isSecurityModificationNode } from '../../tree-node.type';
import { StudyDisplayMode } from '../../../network-modification.type';
import { LoadflowModificationAlert } from './loadflow-modifications/loadflow-modification-alert';

const styles = {
    paper: (theme: Theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        elevation: 3,
        background: theme.palette.background.paper,
    }),
    loadFlowModif: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(2),
        marginRight: theme.spacing(2),
    }),
    icon: (theme: Theme) => ({
        marginRight: theme.spacing(1),
        fontSize: theme.spacing(2.75),
    }),
};

const NodeEditor = () => {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);
    const toggleOptions = useSelector((state: AppState) => state.toggleOptions);

    const closeModificationsDrawer = () => {
        dispatch(setToggleOptions(toggleOptions.filter((option) => option !== StudyDisplayMode.MODIFICATIONS)));
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
            />
            <NetworkModificationNodeEditor />
            {loadFlowStatus === RunningStatus.SUCCEED && isSecurityModificationNode(currentTreeNode) && (
                <LoadflowModificationAlert />
            )}
        </Box>
    );
};

export default NodeEditor;
