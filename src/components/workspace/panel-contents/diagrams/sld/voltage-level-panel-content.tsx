/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { DiagramType } from '../../../../grid-layout/cards/diagrams/diagram.type';
import SingleLineDiagramContent from '../../../../grid-layout/cards/diagrams/singleLineDiagram/single-line-diagram-content';
import { SLDMetadata } from '@powsybl/network-viewer';
import type { UUID } from 'node:crypto';
import { useSldDiagram } from '../../../diagrams/sld/use-sld-diagram';
import { DiagramWrapper } from '../../../diagrams/diagram-wrapper';
import { useDiagramNavigation } from '../../../diagrams/common/use-diagram-navigation';
import { selectSldDiagramFields } from '../../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../../redux/store';
import { SldNavigationSidebar } from '../../../diagrams/sld/sld-navigation-sidebar';
import { useWorkspaceActions } from '../../../hooks/use-workspace-actions';

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
    const sldFields = useSelector((state: RootState) => selectSldDiagramFields(state, panelId));

    const { associateVoltageLevelWithNad, navigateSLD } = useWorkspaceActions();

    const { diagram, loading, globalError } = useSldDiagram({
        diagramType: DiagramType.VOLTAGE_LEVEL,
        diagramId: sldFields?.diagramId ?? '',
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
            const nadPanelId = sldFields?.parentNadPanelId;
            if (nadPanelId) {
                associateVoltageLevelWithNad({ voltageLevelId, nadPanelId });
            } else {
                handleOpenVoltageLevelDiagram(voltageLevelId);
            }
        },
        [sldFields?.parentNadPanelId, associateVoltageLevelWithNad, handleOpenVoltageLevelDiagram]
    );

    const handleNavigateDiagram = useCallback(
        (voltageLevelId: string) => {
            navigateSLD({ panelId, voltageLevelId });
        },
        [panelId, navigateSLD]
    );

    const handleNavigateFromHistory = useCallback(
        (voltageLevelId: string) => {
            navigateSLD({ panelId, voltageLevelId, skipHistory: true });
        },
        [panelId, navigateSLD]
    );

    if (!sldFields) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', height: '100%', width: '100%', position: 'relative' }}>
            <SldNavigationSidebar
                navigationHistory={sldFields.navigationHistory || []}
                currentVoltageLevelId={sldFields.diagramId}
                onNavigate={handleNavigateFromHistory}
            />
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <DiagramWrapper loading={loading} hasSvg={!!diagram.svg} globalError={globalError}>
                    <SingleLineDiagramContent
                        diagramParams={{
                            type: DiagramType.VOLTAGE_LEVEL,
                            voltageLevelId: sldFields.diagramId,
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
