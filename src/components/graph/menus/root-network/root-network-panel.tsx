/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';
import { Paper, useTheme } from '@mui/material';
import RootNetworkPanelHeader from './root-network-panel-header';
import RootNetworkMinimizedPanelContent from './root-network-minimized-panel-content';
import RootNetworkNodeEditor from './root-network-node-editor';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { RootNetworkMetadata } from '../network-modifications/network-modification-menu.type';
import { UUID } from 'crypto';
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
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const [selectedItems, setSelectedItems] = useState<RootNetworkMetadata[]>([]);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const currentRootNetworkUuidRef = useRef<UUID | null>(null);
    currentRootNetworkUuidRef.current = currentRootNetworkUuid;

    const rootNetworksRef = useRef<RootNetworkMetadata[]>([]);
    rootNetworksRef.current = rootNetworks;

    const updateSelectedItems = useCallback((rootNetworks: RootNetworkMetadata[]) => {
        const toKeepIdsSet = new Set(rootNetworks.map((e) => e.rootNetworkUuid));
        setSelectedItems((oldselectedItems) => oldselectedItems.filter((s) => toKeepIdsSet.has(s.rootNetworkUuid)));
    }, []);

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
        studyUuid,
        setIsRootNetworksProcessing,
        rootNetworksRef,
        currentRootNetworkUuidRef,
        updateSelectedItems,
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
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                />
            )}
        </Paper>
    );
};

export default RootNetworkPanel;
