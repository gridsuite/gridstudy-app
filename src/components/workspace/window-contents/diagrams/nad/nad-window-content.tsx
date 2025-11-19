/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { DiagramType } from '../../../../grid-layout/cards/diagrams/diagram.type';
import type {
    NetworkAreaDiagramParams,
    DiagramAdditionalMetadata,
} from '../../../../grid-layout/cards/diagrams/diagram.type';
import NetworkAreaDiagramContent from '../../../../grid-layout/cards/diagrams/networkAreaDiagram/network-area-diagram-content';
import { DiagramWindowData } from '../../../types/workspace.types';
import { updateWindowData } from '../../../../../redux/slices/workspace-slice';
import { DiagramMetadata } from '@powsybl/network-viewer';
import type { UUID } from 'node:crypto';
import { useNadDiagram } from './use-nad-diagram';
import { useDiagramCommon } from '../common/use-diagram-common';
import { DiagramWrapper } from '../diagram-wrapper';

interface NadWindowContentProps {
    diagramData: DiagramWindowData;
    windowId: string;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const NadWindowContent = ({
    diagramData,
    windowId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
}: NadWindowContentProps) => {
    const dispatch = useDispatch();

    const { diagram, loading, globalError, updateDiagram, handleSaveNad } = useNadDiagram({
        diagramData,
        diagramUuid: windowId as UUID,
        windowId,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
    });

    const { showInSpreadsheet, openDiagram } = useDiagramCommon();

    const handleNadChange = useCallback(
        (params: NetworkAreaDiagramParams, fetch: boolean = true) => {
            const isLoadingNew = params.voltageLevelIds?.length === 0;

            // Don't persist voluminous data (voltageLevelIds, positions) in Redux
            // Only store the essential config references (UUIDs)
            const { voltageLevelIds, voltageLevelToExpandIds, voltageLevelToOmitIds, positions, ...essentialParams } =
                params;

            dispatch(
                updateWindowData({
                    windowId,
                    data: {
                        diagramType: DiagramType.NETWORK_AREA_DIAGRAM,
                        ...essentialParams,
                        ...(isLoadingNew ? { savedWorkspaceConfigUuid: undefined } : {}),
                    },
                })
            );
            updateDiagram(params, fetch);
        },
        [dispatch, windowId, updateDiagram]
    );

    const diagramParams = useMemo(
        () =>
            ({
                diagramUuid: diagram.diagramUuid,
                type: DiagramType.NETWORK_AREA_DIAGRAM as const,
                name: diagram.name,
                nadConfigUuid: diagram.nadConfigUuid,
                filterUuid: diagram.filterUuid,
                voltageLevelIds: diagram.voltageLevelIds || [],
                voltageLevelToExpandIds: diagram.voltageLevelToExpandIds || [],
                voltageLevelToOmitIds: diagram.voltageLevelToOmitIds || [],
                positions: diagram.positions || [],
            }) as NetworkAreaDiagramParams,
        [diagram]
    );

    return (
        <DiagramWrapper loading={loading} hasSvg={!!diagram.svg} globalError={globalError}>
            <NetworkAreaDiagramContent
                diagramParams={diagramParams}
                showInSpreadsheet={showInSpreadsheet}
                svg={diagram.svg?.svg ?? undefined}
                svgMetadata={(diagram.svg?.metadata as DiagramMetadata) ?? undefined}
                svgScalingFactor={
                    (diagram.svg?.additionalMetadata as DiagramAdditionalMetadata | undefined)?.scalingFactor
                }
                svgVoltageLevels={diagram.voltageLevelIds}
                loadingState={loading}
                diagramSizeSetter={() => {}}
                visible
                onVoltageLevelClick={openDiagram}
                onNadChange={handleNadChange}
                onSaveNad={handleSaveNad}
            />
        </DiagramWrapper>
    );
};
