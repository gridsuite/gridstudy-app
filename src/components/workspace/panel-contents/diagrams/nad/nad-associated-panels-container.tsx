/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import type { UUID } from 'node:crypto';
import { AssociatedSldPanel } from './associated-sld-panel';
import { AssociatedSldsChips } from './associated-slds-chips';
import { useSldPanels } from './hooks/use-sld-panels';
import { useSldLayout } from './hooks/use-sld-layout';

interface NadAssociatedPanelsContainerProps {
    readonly nadPanelId: UUID;
    readonly onRequestAssociation: (voltageLevelId: string) => void;
}

/**
 * Container that manages all associated SLD panels and chips for a NAD panel.
 * This component accesses Redux state and prevents NAD diagram from rerendering
 * when SLD panel states change.
 */
export const NadAssociatedPanelsContainer = memo(function NadAssociatedPanelsContainer({
    nadPanelId,
    onRequestAssociation,
}: NadAssociatedPanelsContainerProps) {
    const [isDraggingAny, setIsDraggingAny] = useState(false);

    // Access SLD-specific Redux state here, not in parent
    const { associatedPanelIds, visibleSldPanels, focusedSldId, handleBringToFront, handleToggleSldVisibility } =
        useSldPanels({ nadPanelId });

    const { handleReorganize, handleHideAll } = useSldLayout({
        nadPanelId,
        visibleSldPanels,
        associatedPanelIds,
    });

    const handleDragStart = useCallback(() => {
        setIsDraggingAny(true);
    }, []);

    const handleDragEnd = useCallback(() => {
        setIsDraggingAny(false);
    }, []);

    return (
        <>
            {/* Overlay to block NAD interactions during drag */}
            {isDraggingAny && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999,
                        pointerEvents: 'auto',
                        cursor: 'grabbing',
                    }}
                />
            )}

            {/* Associated SLD panels */}
            {visibleSldPanels.map((sldPanelId) => (
                <AssociatedSldPanel
                    key={sldPanelId}
                    sldPanelId={sldPanelId}
                    isFocused={focusedSldId === sldPanelId}
                    onRequestAssociation={onRequestAssociation}
                    onBringToFront={handleBringToFront}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                />
            ))}

            {/* Chips bar at bottom */}
            <AssociatedSldsChips
                nadPanelId={nadPanelId}
                onToggleVisibility={handleToggleSldVisibility}
                onReorganize={handleReorganize}
                onHideAll={handleHideAll}
            />
        </>
    );
});
