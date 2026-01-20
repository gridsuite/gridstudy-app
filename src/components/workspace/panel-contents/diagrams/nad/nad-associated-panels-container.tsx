/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../../redux/store';
import { store } from '../../../../../redux/store';
import {
    selectFocusedAssociatedSldId,
    selectPanel,
    selectVisibleAssociatedSldPanelIds,
} from '../../../../../redux/slices/workspace-selectors';
import { useWorkspaceActions } from '../../../hooks/use-workspace-actions';
import { AssociatedSldPanel } from './associated-sld-panel';
import { AssociatedSldsChips } from './associated-slds-chips';
import { useSldLayout } from './hooks/use-sld-layout';

interface NadAssociatedPanelsContainerProps {
    readonly nadPanelId: UUID;
    readonly onDragStateChange?: (isDragging: boolean) => void;
}

export const NadAssociatedPanelsContainer = memo(function NadAssociatedPanelsContainer({
    nadPanelId,
    onDragStateChange,
}: NadAssociatedPanelsContainerProps) {
    const { toggleMinimized, focusPanel } = useWorkspaceActions();

    const focusedSldId = useSelector((state: RootState) => selectFocusedAssociatedSldId(state, nadPanelId));
    const visibleSldPanelIds = useSelector((state: RootState) => selectVisibleAssociatedSldPanelIds(state, nadPanelId));

    const handleToggleSldVisibility = useCallback(
        (sldPanelId: UUID) => {
            const panel = selectPanel(store.getState(), sldPanelId);
            if (!panel) return;

            const isVisible = !panel.minimized;

            if (isVisible) {
                if (focusedSldId === sldPanelId) {
                    toggleMinimized(sldPanelId);
                } else {
                    focusPanel(sldPanelId);
                }
            } else {
                focusPanel(sldPanelId);
            }
        },
        [focusPanel, focusedSldId, toggleMinimized]
    );

    const { handleReorganize, toggleHideAll } = useSldLayout({ nadPanelId });

    const handleDragStart = useCallback(() => {
        onDragStateChange?.(true);
    }, [onDragStateChange]);

    const handleDragStop = useCallback(() => {
        onDragStateChange?.(false);
    }, [onDragStateChange]);

    return (
        <>
            {visibleSldPanelIds.map((sldPanelId) => (
                <AssociatedSldPanel
                    key={sldPanelId}
                    sldPanelId={sldPanelId}
                    isFocused={focusedSldId === sldPanelId}
                    onDragStart={handleDragStart}
                    onDragStop={handleDragStop}
                />
            ))}

            <AssociatedSldsChips
                nadPanelId={nadPanelId}
                onToggleVisibility={handleToggleSldVisibility}
                onReorganize={handleReorganize}
                onHideAll={toggleHideAll}
            />
        </>
    );
});
