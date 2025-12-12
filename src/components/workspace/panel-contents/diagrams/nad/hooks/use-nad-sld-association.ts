/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch, useStore } from 'react-redux';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../../../redux/store';
import type { NADPanelMetadata, SLDPanelMetadata } from '../../../../types/workspace.types';
import {
    addToNadNavigationHistory,
    openSldAndAssociateToNad,
    openPanel,
    updatePanelZIndex,
} from '../../../../../../redux/slices/workspace-slice';
import { selectPanelMetadata, selectPanelsRecord } from '../../../../../../redux/slices/workspace-selectors';

export interface UseNadSldAssociationParams {
    readonly nadPanelId: UUID;
}

export interface UseNadSldAssociationReturn {
    readonly handleVoltageLevelClick: (voltageLevelId: string) => void;
    readonly handleNavigationSidebarClick: (voltageLevelId: string) => void;
}

export const useNadSldAssociation = ({ nadPanelId }: UseNadSldAssociationParams): UseNadSldAssociationReturn => {
    const dispatch = useDispatch();
    const store = useStore<RootState>();

    // Shared logic for opening or focusing an SLD panel associated with this NAD
    const openOrFocusSld = useCallback(
        (voltageLevelId: string, shouldUpdateHistory: boolean) => {
            // Update navigation history if requested (only for direct voltage level clicks, not sidebar navigation)
            if (shouldUpdateHistory) {
                dispatch(addToNadNavigationHistory({ panelId: nadPanelId, voltageLevelId }));
            }

            // Check if voltage level is already associated - read fresh from store to avoid subscription to all panels
            // to prevent unnecessary re-renders
            const currentMetadata = selectPanelMetadata(store.getState(), nadPanelId) as NADPanelMetadata | undefined;
            const associatedPanelIds = currentMetadata?.associatedVoltageLevelPanels || [];
            const panels = selectPanelsRecord(store.getState());
            const existingSldPanelId = associatedPanelIds.find((id) => {
                const metadata = panels[id]?.metadata as SLDPanelMetadata | undefined;
                return metadata?.diagramId === voltageLevelId;
            });

            if (existingSldPanelId) {
                // Already associated, ensure it's visible and bring to front
                const panel = panels[existingSldPanelId];
                if (panel?.isClosed) {
                    dispatch(openPanel(existingSldPanelId));
                }
                dispatch(updatePanelZIndex(existingSldPanelId));
            } else {
                // Not associated yet, open and associate it (reducer handles opening and z-index)
                dispatch(openSldAndAssociateToNad({ voltageLevelId, nadPanelId }));
            }
        },
        [dispatch, nadPanelId, store]
    );

    // Handle voltage level click - open/associate SLD for voltage level
    const handleVoltageLevelClick = useCallback(
        (voltageLevelId: string) => {
            openOrFocusSld(voltageLevelId, true);
        },
        [openOrFocusSld]
    );

    // Handle navigation sidebar click - open/associate voltage level diagram with NAD
    const handleNavigationSidebarClick = useCallback(
        (voltageLevelId: string) => {
            openOrFocusSld(voltageLevelId, false);
        },
        [openOrFocusSld]
    );

    return {
        handleVoltageLevelClick,
        handleNavigationSidebarClick,
    };
};
