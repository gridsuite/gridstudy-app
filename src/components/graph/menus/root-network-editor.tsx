/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { lighten, darken } from '@mui/material/styles';
import NetworkModificationNodeEditor from './network-modification-node-editor';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { EditableTitle } from './editable-title';
import { useDispatch, useSelector } from 'react-redux';
import { setModificationsDrawerOpen } from '../../../redux/actions';
import { updateTreeNode } from '../../../services/study/tree-subtree';
import { Box } from '@mui/material';
import { AppState } from '../../../redux/reducer';
import { Theme } from '@mui/material/styles';
import RootNetworkNodeEditor from './root-network-node-editor';

const styles = {
    paper: (theme: Theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        elevation: 3,
        //   background: "red",
    }),
};

const RootNetworkEditor = () => {
    const dispatch = useDispatch();
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);

    const closeModificationsDrawer = () => {
        dispatch(setModificationsDrawerOpen(false));
    };

    return (
        <Box sx={styles.paper}>
            <EditableTitle
                name={currentTreeNode?.data?.label ?? ''}
                onClose={closeModificationsDrawer}
                isCloseIconVisible={false}
            />
            <RootNetworkNodeEditor />
        </Box>
    );
};

RootNetworkEditor.propTypes = {
    className: PropTypes.string,
};

export default RootNetworkEditor;
