/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import type { DiagramAdditionalMetadata } from '../../../../grid-layout/cards/diagrams/diagram.type';
import NetworkAreaDiagramContent from '../../../../grid-layout/cards/diagrams/networkAreaDiagram/network-area-diagram-content';
import { NADPanelMetadata } from '../../../types/workspace.types';
import { updatePanelMetadata } from '../../../../../redux/slices/workspace-slice';
import { DiagramMetadata } from '@powsybl/network-viewer';
import type { UUID } from 'node:crypto';
import { useNadDiagram } from '../../../diagrams/nad/use-nad-diagram';
import { DiagramWrapper } from '../../../diagrams/diagram-wrapper';
import type { DiagramConfigPosition } from '../../../../../services/explore';
import { useDiagramNavigation } from '../../../diagrams/common/use-diagram-navigation';
import { selectPanelMetadata } from '../../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../../redux/store';
import { NadNavigationSidebar } from '../../../diagrams/nad/nad-navigation-sidebar';
import { NadAssociatedPanelsContainer } from './nad-associated-panels-container';
import { useNadSldAssociation } from './hooks/use-nad-sld-association';

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
    const dispatch = useDispatch();
    const [isDraggingSld, setIsDraggingSld] = useState(false);
    const diagramMetadata = useSelector((state: RootState) => selectPanelMetadata(state, panelId)) as
        | NADPanelMetadata
        | undefined;

    const { handleVoltageLevelClick } = useNadSldAssociation({ nadPanelId: panelId });

    const { diagram, loading, globalError, updateDiagram, handleSaveNad, cleanupSavedNadConfig } = useNadDiagram({
        panelId,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
    });

    const { handleShowInSpreadsheet } = useDiagramNavigation();

    // Update voltage levels in local state only - no Redux dispatch
    const handleUpdateVoltageLevels = useCallback(
        (params: { voltageLevelIds: string[]; voltageLevelToExpandIds: string[]; voltageLevelToOmitIds: string[] }) => {
            updateDiagram(params, true);
        },
        [updateDiagram]
    );

    // Update voltage levels from a filter in global state (redux)
    const handleUpdateVoltageLevelsFromFilter = useCallback(
        (filterUuid?: UUID) => {
            dispatch(
                updatePanelMetadata({
                    panelId,
                    metadata: {
                        currentFilterUuid: filterUuid,
                    },
                })
            );
        },
        [dispatch, panelId]
    );

    // Update positions in local state only - no Redux dispatch, no fetch
    const handleUpdatePositions = useCallback(
        (positions: DiagramConfigPosition[]) => {
            updateDiagram({ positions }, false);
        },
        [updateDiagram]
    );

    // Replace NAD config - updates Redux metadata only
    // The useEffect in use-nad-diagram will handle the fetch when diagramData changes
    const handleReplaceNad = useCallback(
        (name: string, nadConfigUuid?: UUID, filterUuid?: UUID) => {
            // Delete the old saved config before replacing
            cleanupSavedNadConfig();

            dispatch(
                updatePanelMetadata({
                    panelId,
                    title: name,
                    metadata: {
                        nadConfigUuid,
                        filterUuid,
                        savedWorkspaceConfigUuid: undefined,
                        initialVoltageLevelIds: undefined,
                    },
                })
            );
        },
        [dispatch, panelId, cleanupSavedNadConfig]
    );

    if (!diagramMetadata) {
        return null;
    }

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
                        svgScalingFactor={
                            (diagram.svg?.additionalMetadata as DiagramAdditionalMetadata | undefined)?.scalingFactor
                        }
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
