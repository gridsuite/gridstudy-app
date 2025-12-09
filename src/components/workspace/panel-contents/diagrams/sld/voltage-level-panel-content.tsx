/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { DiagramType } from '../../../../grid-layout/cards/diagrams/diagram.type';
import SingleLineDiagramContent from '../../../../grid-layout/cards/diagrams/singleLineDiagram/single-line-diagram-content';
import { navigateSLD } from '../../../../../redux/slices/workspace-slice';
import { SLDMetadata } from '@powsybl/network-viewer';
import type { UUID } from 'node:crypto';
import { useSldDiagram } from '../../../diagrams/sld/use-sld-diagram';
import { DiagramWrapper } from '../../../diagrams/diagram-wrapper';
import { useDiagramNavigation } from '../../../diagrams/common/use-diagram-navigation';
import { selectPanelMetadata } from '../../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../../redux/store';
import { SLDPanelMetadata } from 'components/workspace/types/workspace.types';
import { SldNavigationSidebar } from '../../../diagrams/sld/sld-navigation-sidebar';
import { openSldAndAssociateToNad } from '../../../../../redux/slices/workspace-slice';

interface VoltageLevelPanelContentProps {
    panelId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
    onRequestAssociation?: (voltageLevelId: string) => void;
}

export const VoltageLevelPanelContent = ({
    panelId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
    onRequestAssociation,
}: VoltageLevelPanelContentProps) => {
    const dispatch = useDispatch();
    const metadata = useSelector((state: RootState) => selectPanelMetadata(state, panelId)) as
        | SLDPanelMetadata
        | undefined;

    const { diagram, loading, globalError } = useSldDiagram({
        diagramType: DiagramType.VOLTAGE_LEVEL,
        diagramId: metadata!.diagramId,
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
            const nadPanelId = metadata?.associatedToNadPanel;
            if (nadPanelId) {
                if (onRequestAssociation) {
                    onRequestAssociation(voltageLevelId);
                } else {
                    dispatch(openSldAndAssociateToNad({ voltageLevelId, nadPanelId }));
                }
            } else {
                handleOpenVoltageLevelDiagram(voltageLevelId);
            }
        },
        [metadata?.associatedToNadPanel, onRequestAssociation, dispatch, handleOpenVoltageLevelDiagram]
    );

    const handleNavigateDiagram = useCallback(
        (voltageLevelId: string) => {
            dispatch(navigateSLD({ panelId, voltageLevelId }));
        },
        [dispatch, panelId]
    );

    const handleNavigateFromHistory = useCallback(
        (voltageLevelId: string) => {
            dispatch(navigateSLD({ panelId, voltageLevelId, skipHistory: true }));
        },
        [dispatch, panelId]
    );

    if (!metadata) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', height: '100%', width: '100%', position: 'relative' }}>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <DiagramWrapper loading={loading} hasSvg={!!diagram.svg} globalError={globalError}>
                    <SingleLineDiagramContent
                        diagramParams={{
                            type: DiagramType.VOLTAGE_LEVEL,
                            voltageLevelId: metadata.diagramId,
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
                    />
                </DiagramWrapper>
            </Box>
            <SldNavigationSidebar
                navigationHistory={metadata.navigationHistory || []}
                currentVoltageLevelId={metadata.diagramId}
                onNavigate={handleNavigateFromHistory}
            />
        </Box>
    );
};
