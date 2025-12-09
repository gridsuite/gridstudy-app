/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useStore } from 'react-redux';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../../../redux/store';
import type { NADPanelMetadata, SLDPanelMetadata } from '../../../../types/workspace.types';
import { addToNadNavigationHistory, openSldAndAssociateToNad } from '../../../../../../redux/slices/workspace-slice';
import { selectPanelMetadata, selectPanelsRecord } from '../../../../../../redux/slices/workspace-selectors';

export interface UseNadSldAssociationParams {
    readonly panelId: UUID;
    readonly diagramMetadata: NADPanelMetadata | undefined;
}

export interface UseNadSldAssociationReturn {
    readonly focusedSldPanelId: UUID | null;
    readonly fullscreenSldPanelId: UUID | null;
    readonly setFocusedSldPanelId: React.Dispatch<React.SetStateAction<UUID | null>>;
    readonly setFullscreenSldPanelId: React.Dispatch<React.SetStateAction<UUID | null>>;
    readonly handleVoltageLevelClick: (voltageLevelId: string) => void;
    readonly handleNavigationSidebarClick: (voltageLevelId: string) => void;
}

export const useNadSldAssociation = ({
    panelId,
    diagramMetadata,
}: UseNadSldAssociationParams): UseNadSldAssociationReturn => {
    const dispatch = useDispatch();
    const store = useStore<RootState>();

    const [focusedSldPanelId, setFocusedSldPanelId] = useState<UUID | null>(null);
    const [fullscreenSldPanelId, setFullscreenSldPanelId] = useState<UUID | null>(null);

    // Helper to focus an SLD panel while maintaining fullscreen mode
    const focusSldPanel = useCallback((sldPanelId: UUID) => {
        setFocusedSldPanelId(sldPanelId);
        // Maintain fullscreen mode when switching between SLDs
        setFullscreenSldPanelId((prev) => (prev ? sldPanelId : prev));
    }, []);

    // Track previous associated panels to detect when new panels are added
    const prevAssociatedPanelsRef = useRef<UUID[]>([]);

    // Detect when a new SLD is associated
    useEffect(() => {
        const associatedPanelIds = diagramMetadata?.associatedVoltageLevelPanels || [];
        const prevAssociatedPanels = prevAssociatedPanelsRef.current;

        const newPanelId = associatedPanelIds.find((id: UUID) => !prevAssociatedPanels.includes(id));

        if (newPanelId) {
            focusSldPanel(newPanelId);
        }

        prevAssociatedPanelsRef.current = associatedPanelIds;
    }, [diagramMetadata?.associatedVoltageLevelPanels, focusSldPanel]);

    // Shared logic for opening or focusing an SLD panel associated with this NAD
    const openOrFocusSld = useCallback(
        (voltageLevelId: string, shouldUpdateHistory: boolean) => {
            // Update navigation history if requested (only for direct voltage level clicks, not sidebar navigation)
            if (shouldUpdateHistory) {
                dispatch(addToNadNavigationHistory({ panelId, voltageLevelId }));
            }

            // Check if voltage level is already associated - read fresh from store to avoid subscription to all panels
            // to prevent unnecessary re-renders
            const currentMetadata = selectPanelMetadata(store.getState(), panelId) as NADPanelMetadata | undefined;
            const associatedPanelIds = currentMetadata?.associatedVoltageLevelPanels || [];
            const panels = selectPanelsRecord(store.getState());
            const existingSldPanelId = associatedPanelIds.find((id) => {
                const metadata = panels[id]?.metadata as SLDPanelMetadata | undefined;
                return metadata?.diagramId === voltageLevelId;
            });

            if (existingSldPanelId) {
                focusSldPanel(existingSldPanelId);
            } else {
                // Not associated yet, open and associate it
                dispatch(openSldAndAssociateToNad({ voltageLevelId, nadPanelId: panelId }));
            }
        },
        [dispatch, panelId, store, focusSldPanel]
    );

    // Handle voltage level click - open/focus SLD for voltage level
    const handleVoltageLevelClick = useCallback(
        (voltageLevelId: string) => {
            openOrFocusSld(voltageLevelId, true);
        },
        [openOrFocusSld]
    );

    // Handle navigation sidebar click - open/focus voltage level diagram associated with NAD
    const handleNavigationSidebarClick = useCallback(
        (voltageLevelId: string) => {
            openOrFocusSld(voltageLevelId, false);
        },
        [openOrFocusSld]
    );

    return {
        focusedSldPanelId,
        fullscreenSldPanelId,
        setFocusedSldPanelId,
        setFullscreenSldPanelId,
        handleVoltageLevelClick,
        handleNavigationSidebarClick,
    };
};
