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
import {
    addToNadNavigationHistory,
    openSldAndAssociateToNad,
    openPanel,
    updatePanelZIndex,
} from '../../../../../../redux/slices/workspace-slice';
import { selectPanel, selectAssociatedSldByVoltageLevelId } from '../../../../../../redux/slices/workspace-selectors';

export interface UseAssociateVoltageLevelParams {
    readonly nadPanelId: UUID | null;
}

export interface UseAssociateVoltageLevelReturn {
    readonly handleAssociate: (voltageLevelId: string, updateHistory?: boolean) => void;
}

export const useAssociateVoltageLevel = ({
    nadPanelId,
}: UseAssociateVoltageLevelParams): UseAssociateVoltageLevelReturn => {
    const dispatch = useDispatch();
    const store = useStore<RootState>();

    const handleAssociate = useCallback(
        (voltageLevelId: string, updateHistory: boolean = true) => {
            if (!nadPanelId) return;

            // Update navigation history if requested (only for direct voltage level clicks, not sidebar navigation)
            if (updateHistory) {
                dispatch(addToNadNavigationHistory({ panelId: nadPanelId, voltageLevelId }));
            }

            // Check if voltage level is already associated using selector
            const state = store.getState();
            const existingSldPanelId = selectAssociatedSldByVoltageLevelId(state, nadPanelId, voltageLevelId);

            if (existingSldPanelId) {
                // Already associated, ensure it's visible and bring to front (without stealing NAD focus)
                const panel = selectPanel(state, existingSldPanelId);
                if (panel?.isClosed) {
                    // openPanel handles z-index for attached SLDs without stealing focus
                    dispatch(openPanel(existingSldPanelId));
                } else {
                    // Panel already open, update z-index without stealing focus from NAD
                    dispatch(updatePanelZIndex(existingSldPanelId));
                }
            } else {
                // Not associated yet, open and associate it (reducer handles opening and z-index)
                dispatch(openSldAndAssociateToNad({ voltageLevelId, nadPanelId }));
            }
        },
        [dispatch, nadPanelId, store]
    );

    return { handleAssociate };
};

export interface UseNadSldAssociationParams {
    readonly nadPanelId: UUID;
}

export interface UseNadSldAssociationReturn {
    readonly handleVoltageLevelClick: (voltageLevelId: string) => void;
    readonly handleNavigationSidebarClick: (voltageLevelId: string) => void;
}

export const useNadSldAssociation = ({ nadPanelId }: UseNadSldAssociationParams): UseNadSldAssociationReturn => {
    const { handleAssociate } = useAssociateVoltageLevel({ nadPanelId });

    // Handle voltage level click - open/associate SLD for voltage level (with history)
    const handleVoltageLevelClick = useCallback(
        (voltageLevelId: string) => {
            handleAssociate(voltageLevelId, true);
        },
        [handleAssociate]
    );

    // Handle navigation sidebar click - open/associate voltage level diagram with NAD (without history)
    const handleNavigationSidebarClick = useCallback(
        (voltageLevelId: string) => {
            handleAssociate(voltageLevelId, false);
        },
        [handleAssociate]
    );

    return {
        handleVoltageLevelClick,
        handleNavigationSidebarClick,
    };
};
