/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useState } from 'react';
import { Box } from '@mui/material';
import type { DiagramAdditionalMetadata } from '../../../../grid-layout/cards/diagrams/diagram.type';
import NetworkAreaDiagramContent from '../../../../grid-layout/cards/diagrams/networkAreaDiagram/network-area-diagram-content';
import { DiagramMetadata } from '@powsybl/network-viewer';
import type { UUID } from 'node:crypto';
import { useNadDiagram } from '../../../diagrams/nad/use-nad-diagram';
import { DiagramWrapper } from '../../../diagrams/diagram-wrapper';
import type { DiagramConfigPosition } from '../../../../../services/explore';
import { NadNavigationSidebar } from '../../../diagrams/nad/nad-navigation-sidebar';
import { NadAssociatedPanelsContainer } from './nad-associated-panels-container';
import { useWorkspaceActions } from '../../../hooks/use-workspace-actions';
import { useDiagramNavigation } from '../../../diagrams/common/use-diagram-navigation';

interface NadPanelContentProps {
    panelId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const NadPanelContent = memo(function NadPanelContent({
    panelId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
}: NadPanelContentProps) {
    const [isDraggingSld, setIsDraggingSld] = useState(false);

    const { addToNadNavigationHistory, associateVoltageLevelWithNad } = useWorkspaceActions();

    const { diagram, loading, globalError, updateDiagram, handleSaveNad, replaceNadConfig } = useNadDiagram({
        panelId,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
    });

    const { handleShowInSpreadsheet } = useDiagramNavigation();

    // Handle voltage level click in NAD: add to history + open/associate SLD
    const handleVoltageLevelClick = useCallback(
        (voltageLevelId: string) => {
            addToNadNavigationHistory({ panelId, voltageLevelId });
            associateVoltageLevelWithNad({ voltageLevelId, nadPanelId: panelId });
        },
        [panelId, addToNadNavigationHistory, associateVoltageLevelWithNad]
    );

    const handleUpdateVoltageLevels = useCallback(
        (params: { voltageLevelIds: string[]; voltageLevelToExpandIds: string[]; voltageLevelToOmitIds: string[] }) => {
            updateDiagram(params, true);
        },
        [updateDiagram]
    );

    const handleUpdateVoltageLevelsFromFilter = useCallback(
        (filterUuid?: UUID) => {
            updateDiagram({ currentFilterUuid: filterUuid }, true);
        },
        [updateDiagram]
    );

    // Update positions in local state only - no Redux dispatch, no fetch
    const handleUpdatePositions = useCallback(
        (positions: DiagramConfigPosition[]) => {
            updateDiagram({ positions }, false);
        },
        [updateDiagram]
    );

    const handleReplaceNad = useCallback(
        (name: string, nadConfigUuid?: UUID, filterUuid?: UUID) => {
            replaceNadConfig(name, nadConfigUuid, filterUuid);
        },
        [replaceNadConfig]
    );

    return (
        <Box sx={{ display: 'flex', height: '100%' }}>
            <Box
                sx={{
                    flex: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    pointerEvents: isDraggingSld ? 'none' : 'auto',
                }}
            >
                <DiagramWrapper loading={loading} hasSvg={!!diagram.svg} globalError={globalError}>
                    <NetworkAreaDiagramContent
                        voltageLevelIds={diagram.voltageLevelIds || []}
                        voltageLevelToExpandIds={diagram.voltageLevelToExpandIds || []}
                        voltageLevelToOmitIds={diagram.voltageLevelToOmitIds || []}
                        positions={diagram.positions || []}
                        showInSpreadsheet={handleShowInSpreadsheet}
                        svg={diagram.svg?.svg ?? undefined}
                        svgMetadata={(diagram.svg?.metadata as DiagramMetadata) ?? undefined}
                        additionalMetadata={diagram.svg?.additionalMetadata as DiagramAdditionalMetadata | undefined}
                        svgVoltageLevels={diagram.voltageLevelIds}
                        loadingState={loading}
                        isNadCreationFromFilter={!!diagram.filterUuid}
                        visible
                        onVoltageLevelClick={handleVoltageLevelClick}
                        onUpdateVoltageLevels={handleUpdateVoltageLevels}
                        onUpdateVoltageLevelsFromFilter={handleUpdateVoltageLevelsFromFilter}
                        onUpdatePositions={handleUpdatePositions}
                        onReplaceNad={handleReplaceNad}
                        onSaveNad={handleSaveNad}
                        nadPanelId={panelId}
                    />
                </DiagramWrapper>
                <NadAssociatedPanelsContainer nadPanelId={panelId} onDragStateChange={setIsDraggingSld} />
            </Box>
            <NadNavigationSidebar nadPanelId={panelId} />
        </Box>
    );
});
