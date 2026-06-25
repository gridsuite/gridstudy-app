/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback } from 'react';
import { Box } from '@mui/material';
import type { DiagramAdditionalMetadata } from '../../../../grid-layout/cards/diagrams/diagram.type';
import NetworkAreaDiagramContent from '../../../../grid-layout/cards/diagrams/networkAreaDiagram/network-area-diagram-content';
import { DiagramMetadata } from '@powsybl/network-viewer';
import type { UUID } from 'node:crypto';
import { useNadDiagram } from '../../../diagrams/nad/use-nad-diagram';
import { DiagramWrapper } from '../../../diagrams/diagram-wrapper';
import { NadNavigationSidebar } from '../../../diagrams/nad/nad-navigation-sidebar';
import { NadAssociatedPanelsContainer } from './nad-associated-panels-container';
import { useWorkspacePanelActions } from '../../../hooks/use-workspace-panel-actions';
import { useDiagramNavigation } from '../../../diagrams/common/use-diagram-navigation';
import { useNadVoltageLevelFilter } from '../../../diagrams/nad/use-nad-voltage-level-filter';
import { useNadInfoFilter } from '../../../diagrams/nad/use-nad-info-filter';

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
    const { addToNadNavigationHistory, associateVoltageLevelWithNad } = useWorkspacePanelActions();

    const { diagram, loading, globalError, updateDiagram, handleSaveNad, replaceNadConfig, moveNode, moveTextNode } =
        useNadDiagram({
            panelId,
            studyUuid,
            currentNodeId,
            currentRootNetworkUuid,
        });

    const { handleShowInSpreadsheet } = useDiagramNavigation();

    // Voltage-level band filtering using CSS classes
    const { presentNominalVoltages, selectedNominalVoltages, setSelectedNominalVoltages, unselectedVlNames } =
        useNadVoltageLevelFilter(diagram.svg?.metadata as DiagramMetadata | null | undefined);

    // Information-layer filtering (P/Q values, % IST, arrows, labels) using CSS classes
    const { selectedInfos, toggleSelectedInfo, hiddenInfoSelectors } = useNadInfoFilter();

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
                }}
            >
                <DiagramWrapper loading={loading} hasSvg={!!diagram.svg} globalError={globalError}>
                    <NetworkAreaDiagramContent
                        voltageLevelIds={diagram.voltageLevelIds || []}
                        voltageLevelToExpandIds={diagram.voltageLevelToExpandIds || []}
                        voltageLevelToOmitIds={diagram.voltageLevelToOmitIds || []}
                        showInSpreadsheet={handleShowInSpreadsheet}
                        svg={diagram.svg?.svg ?? undefined}
                        svgMetadata={(diagram.svg?.metadata as DiagramMetadata) ?? undefined}
                        additionalMetadata={diagram.svg?.additionalMetadata as DiagramAdditionalMetadata | undefined}
                        svgVoltageLevels={diagram.voltageLevelIds}
                        hiddenVoltageBands={unselectedVlNames}
                        hiddenInfoSelectors={hiddenInfoSelectors}
                        loadingState={loading}
                        isNadCreationFromFilter={!!diagram.filterUuid}
                        visible
                        onVoltageLevelClick={handleVoltageLevelClick}
                        onUpdateVoltageLevels={handleUpdateVoltageLevels}
                        onUpdateVoltageLevelsFromFilter={handleUpdateVoltageLevelsFromFilter}
                        onMoveNode={moveNode}
                        onMoveTextNode={moveTextNode}
                        onReplaceNad={handleReplaceNad}
                        onSaveNad={handleSaveNad}
                        nadPanelId={panelId}
                    />
                </DiagramWrapper>
                <NadAssociatedPanelsContainer nadPanelId={panelId} />
            </Box>
            {!globalError && (
                <NadNavigationSidebar
                    nadPanelId={panelId}
                    allVoltages={presentNominalVoltages}
                    selectedVoltages={selectedNominalVoltages}
                    onVoltagesChange={setSelectedNominalVoltages}
                    selectedInfos={selectedInfos}
                    onSelectedInfoToggle={toggleSelectedInfo}
                />
            )}
        </Box>
    );
});
