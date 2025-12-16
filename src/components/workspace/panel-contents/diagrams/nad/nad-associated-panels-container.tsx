/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback } from 'react';
import type { UUID } from 'node:crypto';
import { AssociatedSldPanel } from './associated-sld-panel';
import { AssociatedSldsChips } from './associated-slds-chips';
import { useSldPanels } from './hooks/use-sld-panels';
import { useSldLayout } from './hooks/use-sld-layout';

interface NadAssociatedPanelsContainerProps {
    readonly nadPanelId: UUID;
    readonly onDragStateChange?: (isDragging: boolean) => void;
}

export const NadAssociatedPanelsContainer = memo(function NadAssociatedPanelsContainer({
    nadPanelId,
    onDragStateChange,
}: NadAssociatedPanelsContainerProps) {
    const { associatedPanelIds, visibleSldPanels, focusedSldId, handleBringToFront, handleToggleSldVisibility } =
        useSldPanels({ nadPanelId });

    const { handleReorganize, toggleHideAll } = useSldLayout({
        nadPanelId,
        visibleSldPanels,
        associatedPanelIds,
    });

    const handleDragStart = useCallback(() => {
        onDragStateChange?.(true);
    }, [onDragStateChange]);

    const handleDragStop = useCallback(() => {
        onDragStateChange?.(false);
    }, [onDragStateChange]);

    return (
        <>
            {visibleSldPanels.map((sldPanelId) => (
                <AssociatedSldPanel
                    key={sldPanelId}
                    sldPanelId={sldPanelId}
                    isFocused={focusedSldId === sldPanelId}
                    onBringToFront={handleBringToFront}
                    onDragStart={handleDragStart}
                    onDragStop={handleDragStop}
                />
            ))}

            {/* Chips bar at bottom */}
            <AssociatedSldsChips
                nadPanelId={nadPanelId}
                onToggleVisibility={handleToggleSldVisibility}
                onReorganize={handleReorganize}
                onHideAll={toggleHideAll}
            />
        </>
    );
});
