/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { DiagramType } from '../../../../grid-layout/cards/diagrams/diagram.type';
import SingleLineDiagramContent from '../../../../grid-layout/cards/diagrams/singleLineDiagram/single-line-diagram-content';
import { SLDMetadata } from '@powsybl/network-viewer';
import type { UUID } from 'node:crypto';
import { useSldDiagram } from '../../../diagrams/sld/use-sld-diagram';
import { DiagramWrapper } from '../../../diagrams/diagram-wrapper';
import { useDiagramNavigation } from '../../../diagrams/common/use-diagram-navigation';
import { selectPanel } from '../../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../../redux/store';
import { SLDSubstationPanel } from 'components/workspace/types/workspace.types';

interface SubstationPanelContentProps {
    panelId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const SubstationPanelContent = ({
    panelId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
}: SubstationPanelContentProps) => {
    const panel = useSelector((state: RootState) => selectPanel(state, panelId)) as SLDSubstationPanel | undefined;

    const { diagram, loading, globalError } = useSldDiagram({
        diagramType: DiagramType.SUBSTATION,
        diagramId: panel!.diagramId,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
    });

    const { handleShowInSpreadsheet, handleOpenVoltageLevelDiagram } = useDiagramNavigation();

    if (!panel) {
        return null;
    }

    return (
        <Box sx={{ height: '100%', overflow: 'hidden' }}>
            <DiagramWrapper loading={loading} hasSvg={!!diagram.svg} globalError={globalError}>
                <SingleLineDiagramContent
                    diagramParams={{
                        type: DiagramType.SUBSTATION,
                        substationId: panel.diagramId,
                    }}
                    showInSpreadsheet={handleShowInSpreadsheet}
                    studyUuid={studyUuid}
                    panelId={panelId}
                    svg={diagram.svg?.svg ?? undefined}
                    svgMetadata={diagram.svg?.metadata as SLDMetadata}
                    loadingState={loading}
                    visible
                    onNewVoltageLevelDiagram={handleOpenVoltageLevelDiagram}
                    onNextVoltageLevelDiagram={handleOpenVoltageLevelDiagram}
                />
            </DiagramWrapper>
        </Box>
    );
};
