/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { Paper, useTheme } from '@mui/material';
import RootNetworkPanelHeader from './root-network-panel-header';
import RootNetworkNodeEditor from './root-network-node-editor';
import { useSelector } from 'react-redux';
import { type MuiStyles } from '@gridsuite/commons-ui';
import { AppState } from 'redux/reducer.type';
import RootNetworkSearchPanel from './root-network-panel-search';

const styles = {
    paper: {
        position: 'absolute',
        top: 8,
        left: 8,
        borderRadius: '8px',
        zIndex: 10,
        overflow: 'hidden',
    },
} as const satisfies MuiStyles;

const RootNetworkPanel: FunctionComponent = () => {
    const [isRootNetworksProcessing, setIsRootNetworksProcessing] = useState(false);
    const [isRootNetworkPanelMinimized, setIsRootNetworkPanelMinimized] = useState(true);
    const isMonoRootStudy = useSelector((state: AppState) => state.isMonoRootStudy);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const [isSearchActive, setIsSearchActive] = useState(false);

    const theme = useTheme();
    // Set the panel's width and height based on designer's proposed values
    const panelStyle = useMemo(() => {
        const width = theme.spacing(isRootNetworkPanelMinimized ? 36 : 42);

        let minHeightSpacing: number;
        if (isRootNetworkPanelMinimized) {
            minHeightSpacing = 5;
        } else if (isMonoRootStudy) {
            minHeightSpacing = 14;
        } else {
            minHeightSpacing = 38;
        }
        const minHeight = theme.spacing(minHeightSpacing);

        return {
            ...styles.paper,
            width,
            minHeight,
        };
    }, [isRootNetworkPanelMinimized, isMonoRootStudy, theme]);

    // This is used to hide the loader for creation, update and deletion of the root networks.
    // All the root networks must be fully established before the loader can be safely removed.
    useEffect(() => {
        if (rootNetworks.every((network) => !network.isCreating)) {
            setIsRootNetworksProcessing(false);
        }
    }, [rootNetworks]);

    const closeSearchPanel = useCallback(() => {
        setIsSearchActive(false);
    }, []);

    return (
        <Paper elevation={3} sx={panelStyle}>
            <RootNetworkPanelHeader
                isRootNetworksProcessing={isRootNetworksProcessing}
                setIsRootNetworksProcessing={setIsRootNetworksProcessing}
                isRootNetworkPanelMinimized={isRootNetworkPanelMinimized}
                setIsRootNetworkPanelMinimized={setIsRootNetworkPanelMinimized}
                setIsSearchActive={setIsSearchActive}
                closeSearchPanel={closeSearchPanel}
            />
            {!isSearchActive && !isRootNetworkPanelMinimized && (
                <RootNetworkNodeEditor
                    isRootNetworksProcessing={isRootNetworksProcessing}
                    setIsRootNetworksProcessing={setIsRootNetworksProcessing}
                />
            )}
            {isSearchActive && <RootNetworkSearchPanel setIsSearchActive={setIsSearchActive} />}
        </Paper>
    );
};

export default RootNetworkPanel;
