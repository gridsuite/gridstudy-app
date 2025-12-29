/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box } from '@mui/material';
import { DiagramType } from '../../../../grid-layout/cards/diagrams/diagram.type';
import SingleLineDiagramContent from '../../../../grid-layout/cards/diagrams/singleLineDiagram/single-line-diagram-content';
import { SLDMetadata } from '@powsybl/network-viewer';
import type { UUID } from 'node:crypto';
import { useSldDiagram } from '../../../diagrams/sld/use-sld-diagram';
import { DiagramWrapper } from '../../../diagrams/diagram-wrapper';
import { useDiagramNavigation } from '../../../diagrams/common/use-diagram-navigation';
import { selectPanel, selectNadForSld } from '../../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../../redux/store';
import { SLDVoltageLevelPanel } from 'components/workspace/types/workspace.types';
import { SldNavigationSidebar } from '../../../diagrams/sld/sld-navigation-sidebar';
import { useAssociateVoltageLevel } from '../../../../workspace/panel-contents/diagrams/nad/hooks/use-nad-sld-association';
import { updatePanels } from '../../../../../redux/slices/workspace-slice';

interface VoltageLevelPanelContentProps {
    panelId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
    onSvgLoad?: (width: number, height: number) => void;
}

export const VoltageLevelPanelContent = ({
    panelId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
    onSvgLoad,
}: VoltageLevelPanelContentProps) => {
    const panel = useSelector((state: RootState) => selectPanel(state, panelId)) as SLDVoltageLevelPanel | undefined;
    const nadPanelId = useSelector((state: RootState) => selectNadForSld(state, panelId));
    const dispatch = useDispatch();

    const { handleAssociate } = useAssociateVoltageLevel({ nadPanelId });

    const { diagram, loading, globalError } = useSldDiagram({
        diagramType: DiagramType.VOLTAGE_LEVEL,
        diagramId: panel!.diagramId,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
    });

    const { handleShowInSpreadsheet, handleOpenVoltageLevelDiagram } = useDiagramNavigation();

    // Handle Ctrl+click on voltage level arrows
    // If this SLD is associated with a NAD, associate the new SLD with the same NAD
    // Otherwise, open a standalone SLD panel
    const handleNewVoltageLevelClick = useCallback(
        (voltageLevelId: string) => {
            if (nadPanelId) {
                handleAssociate(voltageLevelId);
            } else {
                handleOpenVoltageLevelDiagram(voltageLevelId);
            }
        },
        [nadPanelId, handleAssociate, handleOpenVoltageLevelDiagram]
    );

    // Navigate to a different voltage level diagram (for arrows)
    const handleNavigateDiagram = useCallback(
        (voltageLevelId: string) => {
            if (!panel) return;
            // Add to navigation history
            const newHistory = [...(panel.navigationHistory || []), panel.diagramId];
            dispatch(updatePanels([{ ...panel, diagramId: voltageLevelId, navigationHistory: newHistory }]));
        },
        [panel, dispatch]
    );

    // Navigate from history (sidebar click)
    const handleNavigateFromHistory = useCallback(
        (voltageLevelId: string) => {
            if (!panel) return;
            dispatch(updatePanels([{ ...panel, diagramId: voltageLevelId }]));
        },
        [panel, dispatch]
    );

    if (!panel) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', height: '100%', width: '100%', position: 'relative' }}>
            <SldNavigationSidebar
                navigationHistory={panel.navigationHistory || []}
                currentVoltageLevelId={panel.diagramId}
                onNavigate={handleNavigateFromHistory}
            />
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <DiagramWrapper loading={loading} hasSvg={!!diagram.svg} globalError={globalError}>
                    <SingleLineDiagramContent
                        diagramParams={{
                            type: DiagramType.VOLTAGE_LEVEL,
                            voltageLevelId: panel.diagramId,
                        }}
                        showInSpreadsheet={handleShowInSpreadsheet}
                        studyUuid={studyUuid}
                        panelId={panelId}
                        svg={diagram.svg?.svg ?? undefined}
                        svgMetadata={diagram.svg?.metadata as SLDMetadata}
                        loadingState={loading}
                        visible
                        onNewVoltageLevelDiagram={handleNewVoltageLevelClick}
                        onNextVoltageLevelDiagram={handleNavigateDiagram}
                        onSvgLoad={onSvgLoad}
                    />
                </DiagramWrapper>
            </Box>
        </Box>
    );
};
