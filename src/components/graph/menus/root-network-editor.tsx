/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { EditableTitle } from './editable-title';
import { Box } from '@mui/material';
import { AppState } from '../../../redux/reducer';
import RootNetworkNodeEditor from './root-network-node-editor';
import { useSelector } from 'react-redux';

const styles = {
    paper: () => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        elevation: 3,
    }),
};

const RootNetworkEditor = () => {
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetwork);

    const closeModificationsDrawer = () => {};

    return (
        <Box sx={styles.paper}>
            <EditableTitle //TODO
                name={currentRootNetworkUuid ?? ''}
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
