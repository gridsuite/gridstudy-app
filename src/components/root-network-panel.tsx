/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useMemo, useState } from 'react';
import { Paper, useTheme } from '@mui/material';
import RootNetworkNodeEditor from './graph/menus/root-network-node-editor';
import RootNetworkPanelHeader from './root-network-panel-header';
import RootNetworkMinimizedPanelContent from './graph/menus/root-network-minimized-panel-content';

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
    const [isRootNetworksProcessing, setIsRootNetworksProcessing] = useState(false);
    const [isRootNetworkPanelMinimized, setIsRootNetworkPanelMinimized] = useState(false);

    const theme = useTheme();

    const panelStyle = useMemo(() => {
        return {
            ...styles.paper,
            width: isRootNetworkPanelMinimized ? theme.spacing(22) : theme.spacing(38),
            minHeight: isRootNetworkPanelMinimized ? theme.spacing(12) : theme.spacing(38),
        };
    }, [isRootNetworkPanelMinimized, theme]);
    return (
        <Paper elevation={3} sx={panelStyle}>
            <RootNetworkPanelHeader
                isRootNetworksProcessing={isRootNetworksProcessing}
                setIsRootNetworksProcessing={setIsRootNetworksProcessing}
                isRootNetworkPanelMinimized={isRootNetworkPanelMinimized}
                setIsRootNetworkPanelMinimized={setIsRootNetworkPanelMinimized}
            />

            {isRootNetworkPanelMinimized ? (
                <RootNetworkMinimizedPanelContent />
            ) : (
                <RootNetworkNodeEditor
                    isRootNetworksProcessing={isRootNetworksProcessing}
                    setIsRootNetworksProcessing={setIsRootNetworksProcessing}
                />
            )}
        </Paper>
    );
};

export default RootNetworkPanel;
