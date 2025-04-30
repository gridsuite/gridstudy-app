/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useMemo, useState } from 'react';
import { Paper, useTheme } from '@mui/material';
import RootNetworkPanelHeader from './root-network-panel-header';
import RootNetworkMinimizedPanelContent from './root-network-minimized-panel-content';
import RootNetworkNodeEditor from './root-network-node-editor';
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
    const [isRootNetworksProcessing, setIsRootNetworksProcessing] = useState(false);
    const [isRootNetworkPanelMinimized, setIsRootNetworkPanelMinimized] = useState(false);
    const isMonoRootStudy = useSelector((state: AppState) => state.isMonoRootStudy);

    const theme = useTheme();
    const panelStyle = useMemo(() => {
        const widthSpacing = isRootNetworkPanelMinimized ? theme.spacing(22) : theme.spacing(38);
        let minHeightSpacing;

        if (isRootNetworkPanelMinimized) {
            minHeightSpacing = isMonoRootStudy ? theme.spacing(6) : theme.spacing(12);
        } else {
            minHeightSpacing = isMonoRootStudy ? theme.spacing(14) : theme.spacing(38);
        }

        return {
            ...styles.paper,
            width: widthSpacing,
            minHeight: minHeightSpacing,
        };
    }, [isMonoRootStudy, isRootNetworkPanelMinimized, theme]);

    const renderRootNetworkPanelContent = () => {
        let panelContent;
        if (isRootNetworkPanelMinimized) {
            panelContent = isMonoRootStudy ? null : <RootNetworkMinimizedPanelContent />;
        } else {
            panelContent = (
                <RootNetworkNodeEditor
                    isRootNetworksProcessing={isRootNetworksProcessing}
                    setIsRootNetworksProcessing={setIsRootNetworksProcessing}
                />
            );
        }

        return panelContent;
    };

    return (
        <Paper elevation={3} sx={panelStyle}>
            <RootNetworkPanelHeader
                isRootNetworksProcessing={isRootNetworksProcessing}
                setIsRootNetworksProcessing={setIsRootNetworksProcessing}
                isRootNetworkPanelMinimized={isRootNetworkPanelMinimized}
                setIsRootNetworkPanelMinimized={setIsRootNetworkPanelMinimized}
            />

            {renderRootNetworkPanelContent()}
        </Paper>
    );
};

export default RootNetworkPanel;
