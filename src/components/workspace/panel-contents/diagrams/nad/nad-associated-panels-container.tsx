/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../../redux/store';
import { selectVisibleAssociatedSldPanels } from '../../../../../redux/slices/workspace-selectors';
import { AssociatedSldPanel } from './associated-sld-panel';
import { AssociatedSldsChips } from './associated-slds-chips';
import { useAssociatedSlds } from './hooks/use-sld-panels';
import { useSldLayout } from './hooks/use-sld-layout';

interface NadAssociatedPanelsContainerProps {
    readonly nadPanelId: UUID;
    readonly onDragStateChange?: (isDragging: boolean) => void;
}

export const NadAssociatedPanelsContainer = memo(function NadAssociatedPanelsContainer({
    nadPanelId,
    onDragStateChange,
}: NadAssociatedPanelsContainerProps) {
    const { focusedSldId, handleBringToFront, handleToggleSldVisibility } = useAssociatedSlds({ nadPanelId });

    const visibleSldPanelIds = useSelector(
        (state: RootState) => selectVisibleAssociatedSldPanels(state, nadPanelId).map((p) => p.id),
        shallowEqual
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
                    onBringToFront={handleBringToFront}
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
