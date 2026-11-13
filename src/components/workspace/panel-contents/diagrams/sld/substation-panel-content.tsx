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
import { selectSldDiagramFields } from '../../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../../redux/store';
import { usePendingSwitches } from '../../../diagrams/sld/use-pending-switches';

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
    const sldFields = useSelector((state: RootState) => selectSldDiagramFields(state, panelId));

    const { diagram, loading, globalError } = useSldDiagram({
        diagramType: DiagramType.SUBSTATION,
        equipmentId: sldFields?.equipmentId ?? '',
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
    });

    const { handleShowInSpreadsheet, handleOpenVoltageLevelDiagram } = useDiagramNavigation();
    const { pendingSwitches } = usePendingSwitches();
    // With switch changes to validate, the voltage level panel would open behind the focus mode backdrop
    const handleVoltageLevelClick = pendingSwitches.size > 0 ? undefined : handleOpenVoltageLevelDiagram;

    if (!sldFields) {
        return null;
    }

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <DiagramWrapper loading={loading} hasSvg={!!diagram.svg} globalError={globalError}>
                <SingleLineDiagramContent
                    diagramParams={{
                        type: DiagramType.SUBSTATION,
                        substationId: sldFields.equipmentId,
                    }}
                    showInSpreadsheet={handleShowInSpreadsheet}
                    studyUuid={studyUuid}
                    svg={diagram.svg?.svg ?? undefined}
                    svgMetadata={diagram.svg?.metadata as SLDMetadata}
                    loadingState={loading}
                    visible
                    onNewVoltageLevelDiagram={handleVoltageLevelClick}
                    onNextVoltageLevelDiagram={handleVoltageLevelClick}
                />
            </DiagramWrapper>
        </Box>
    );
};
