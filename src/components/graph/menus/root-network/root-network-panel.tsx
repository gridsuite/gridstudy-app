/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useMemo, useState } from 'react';
import { Paper, useTheme } from '@mui/material';
import RootNetworkPanelHeader from './root-network-panel-header';
import RootNetworkMinimizedPanelContent from './root-network-minimized-panel-content';
import RootNetworkNodeEditor from './root-network-node-editor';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useRootNetworkNotifications } from './use-root-network-notifications';

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
    // Set the panel's width and height based on designer's proposed values
    const panelStyle = useMemo(() => {
        const width = theme.spacing(isRootNetworkPanelMinimized ? 22 : 38);

        const minHeight = theme.spacing(
            isRootNetworkPanelMinimized ? (isMonoRootStudy ? 6 : 12) : isMonoRootStudy ? 14 : 38
        );

        return {
            ...styles.paper,
            width,
            minHeight,
        };
    }, [isRootNetworkPanelMinimized, isMonoRootStudy, theme]);

    //handle root network notifications
    useRootNetworkNotifications({
        setIsRootNetworksProcessing,
    });

    return (
        <Paper elevation={3} sx={panelStyle}>
            <RootNetworkPanelHeader
                isRootNetworksProcessing={isRootNetworksProcessing}
                setIsRootNetworksProcessing={setIsRootNetworksProcessing}
                isRootNetworkPanelMinimized={isRootNetworkPanelMinimized}
                setIsRootNetworkPanelMinimized={setIsRootNetworkPanelMinimized}
            />
            {isRootNetworkPanelMinimized && !isMonoRootStudy && <RootNetworkMinimizedPanelContent />}
            {!isRootNetworkPanelMinimized && (
                <RootNetworkNodeEditor
                    isRootNetworksProcessing={isRootNetworksProcessing}
                    setIsRootNetworksProcessing={setIsRootNetworksProcessing}
                />
            )}
        </Paper>
    );
};

export default RootNetworkPanel;
