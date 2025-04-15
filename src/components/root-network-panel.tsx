/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent } from 'react';
import { Paper } from '@mui/material';
import RootNetworkNodeEditor from './graph/menus/root-network-node-editor';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

const styles = {
    paper: {
        position: 'absolute',
        top: 16,
        left: 16,
        borderRadius: '8px',
        zIndex: 10,
        overflow: 'hidden',
    },
};

const RootNetworkPanel: FunctionComponent = () => {
    const isPanelMinimized = useSelector((state: AppState) => state.isRootNetworkPanelMinimized);

    const panelStyle = {
        ...styles.paper,
        width: isPanelMinimized ? '174px' : '300px',
        minHeight: isPanelMinimized ? '99px' : '300px',
    };

    return (
        <Paper elevation={3} sx={panelStyle}>
            <RootNetworkNodeEditor />
        </Paper>
    );
};

export default RootNetworkPanel;
