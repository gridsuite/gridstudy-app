/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback } from 'react';
import { Box } from '@mui/material';
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
import { useNadPanelLocalState } from '../../../diagrams/nad/use-nad-panel-local-state';

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

    // Voltages checked in the voltage filter, kept here so that loading another NAD can reset them:
    // back to `undefined`, all the voltages of the new NAD get checked once drawn.
    const [voltageSelection, setVoltageSelection] = useNadPanelLocalState(panelId, 'selectedNominalVoltages');
    const resetVoltageSelection = useCallback(() => setVoltageSelection(undefined), [setVoltageSelection]);

    const {
        diagram,
        shownVoltageLevelIds,
        isFilterDeleted,
        loading,
        globalError,
        editDiagram,
        replaceNadConfig,
        history,
        restoreHistoryState,
    } = useNadDiagram({
        panelId,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
        onNadReplaced: resetVoltageSelection,
    });

    const { handleShowInSpreadsheet } = useDiagramNavigation();

    // Voltage-level band filtering using CSS classes
    const { presentNominalVoltages, selectedNominalVoltages, unselectedVlNames } = useNadVoltageLevelFilter(
        diagram.svg?.metadata as DiagramMetadata | null | undefined,
        voltageSelection,
        setVoltageSelection
    );

    // Information-layer filtering (P/Q values, % IST, arrows, labels) using CSS classes
    const { selectedInfos, toggleSelectedInfo, hiddenInfoSelectors } = useNadInfoFilter(panelId);

    // Handle voltage level click in NAD: add to history + open/associate SLD
    const handleVoltageLevelClick = useCallback(
        (voltageLevelId: string) => {
            addToNadNavigationHistory({ panelId, voltageLevelId });
            associateVoltageLevelWithNad({ voltageLevelId, nadPanelId: panelId });
        },
        [panelId, addToNadNavigationHistory, associateVoltageLevelWithNad]
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
                        showInSpreadsheet={handleShowInSpreadsheet}
                        svg={diagram.svg?.svg ?? undefined}
                        svgMetadata={diagram.svg?.metadata ?? undefined}
                        additionalMetadata={diagram.svg?.additionalMetadata ?? undefined}
                        svgVoltageLevels={shownVoltageLevelIds}
                        hiddenVoltageBands={unselectedVlNames}
                        hiddenInfoSelectors={hiddenInfoSelectors}
                        areVoltageLevelNamesHidden={false}
                        loadingState={loading}
                        filterUuid={diagram.filterUuid}
                        filterName={diagram.filterName}
                        isFilterDeleted={isFilterDeleted}
                        hasHiddenVoltageLevels={diagram.voltageLevelToOmitIds.length > 0}
                        visible
                        onVoltageLevelClick={handleVoltageLevelClick}
                        onEdit={editDiagram}
                        onReplaceNad={replaceNadConfig}
                        editHistory={history}
                        onRestoreHistoryState={restoreHistoryState}
                        nadPanelId={panelId}
                    />
                </DiagramWrapper>
                <NadAssociatedPanelsContainer nadPanelId={panelId} />
            </Box>
            {!globalError && (
                <NadNavigationSidebar
                    nadPanelId={panelId}
                    allNominalVoltages={presentNominalVoltages}
                    selectedNominalVoltages={selectedNominalVoltages}
                    onNominalVoltagesChange={setVoltageSelection}
                    selectedInfos={selectedInfos}
                    onSelectedInfoToggle={toggleSelectedInfo}
                />
            )}
        </Box>
    );
});
