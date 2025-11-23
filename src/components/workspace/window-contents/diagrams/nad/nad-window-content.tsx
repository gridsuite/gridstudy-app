/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { DiagramAdditionalMetadata } from '../../../../grid-layout/cards/diagrams/diagram.type';
import NetworkAreaDiagramContent from '../../../../grid-layout/cards/diagrams/networkAreaDiagram/network-area-diagram-content';
import { NADWindowMetadata } from '../../../types/workspace.types';
import { updateWindowMetadata } from '../../../../../redux/slices/workspace-slice';
import { DiagramMetadata } from '@powsybl/network-viewer';
import type { UUID } from 'node:crypto';
import { useNadDiagram } from './use-nad-diagram';
import { DiagramWrapper } from '../diagram-wrapper';
import type { DiagramConfigPosition } from '../../../../../services/explore';
import { useDiagramNavigation } from '../common/use-diagram-navigation';
import { selectWindow } from '../../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../../redux/store';

interface NadWindowContentProps {
    windowId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const NadWindowContent = ({
    windowId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
}: NadWindowContentProps) => {
    const dispatch = useDispatch();
    const window = useSelector((state: RootState) => selectWindow(state, windowId));
    const diagramMetadata = window?.metadata as NADWindowMetadata | undefined;

    const { diagram, loading, globalError, updateDiagram, handleSaveNad } = useNadDiagram({
        diagramMetadata: diagramMetadata!,
        windowId,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
    });

    const { handleShowInSpreadsheet, handleOpenDiagram } = useDiagramNavigation();

    // Update voltage levels in local state only - no Redux dispatch
    const handleUpdateVoltageLevels = useCallback(
        (params: { voltageLevelIds: string[]; voltageLevelToExpandIds: string[]; voltageLevelToOmitIds: string[] }) => {
            updateDiagram(params, true);
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

    // Replace NAD config - updates Redux metadata only
    // The useEffect in use-nad-diagram will handle the fetch when diagramData changes
    const handleReplaceNad = useCallback(
        (name: string, nadConfigUuid?: UUID, filterUuid?: UUID) => {
            const currentMetadata = diagramMetadata as NADWindowMetadata;
            dispatch(
                updateWindowMetadata({
                    windowId,
                    title: name,
                    metadata: {
                        ...currentMetadata,
                        nadConfigUuid,
                        filterUuid,
                        savedWorkspaceConfigUuid: undefined,
                    },
                })
            );
        },
        [dispatch, windowId, diagramMetadata]
    );

    if (!diagramMetadata) {
        return null;
    }

    return (
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
                visible
                onVoltageLevelClick={handleOpenDiagram}
                onUpdateVoltageLevels={handleUpdateVoltageLevels}
                onUpdatePositions={handleUpdatePositions}
                onReplaceNad={handleReplaceNad}
                onSaveNad={handleSaveNad}
            />
        </DiagramWrapper>
    );
};
