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
    VoltageLevelDiagramParams,
    SubstationDiagramParams,
} from '../../../../grid-layout/cards/diagrams/diagram.type';
import SingleLineDiagramContent from '../../../../grid-layout/cards/diagrams/singleLineDiagram/single-line-diagram-content';
import { DiagramWindowData } from '../../../types/workspace.types';
import { updateWindowTitle, updateWindowData } from '../../../../../redux/slices/workspace-slice';
import { SLDMetadata } from '@powsybl/network-viewer';
import type { UUID } from 'node:crypto';
import { useSldDiagram } from './use-sld-diagram';
import { useDiagramCommon } from '../common/use-diagram-common';
import { DiagramWrapper } from '../diagram-wrapper';

interface SldWindowContentProps {
    diagramData: DiagramWindowData;
    windowId: string;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const SldWindowContent = ({
    diagramData,
    windowId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
}: SldWindowContentProps) => {
    const dispatch = useDispatch();

    const { diagram, loading, globalError, updateDiagram } = useSldDiagram({
        diagramData,
        diagramUuid: windowId as UUID,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
    });

    const { showInSpreadsheet, openDiagram } = useDiagramCommon();

    const handleNavigateDiagram = useCallback(
        (params: VoltageLevelDiagramParams | SubstationDiagramParams) => {
            const newParams = {
                diagramType: params.type,
                voltageLevelId: params.type === DiagramType.VOLTAGE_LEVEL ? params.voltageLevelId : undefined,
                substationId: params.type === DiagramType.SUBSTATION ? params.substationId : undefined,
                name: params.name,
            };
            // Update window title with the new diagram ID
            const newTitle = params.type === DiagramType.VOLTAGE_LEVEL ? params.voltageLevelId : params.substationId;
            dispatch(updateWindowTitle({ windowId, title: newTitle }));
            dispatch(updateWindowData({ windowId, data: newParams }));
            updateDiagram(params);
        },
        [dispatch, windowId, updateDiagram]
    );

    const diagramParams = useMemo(() => {
        if (diagram.type === DiagramType.VOLTAGE_LEVEL && 'voltageLevelId' in diagram) {
            return {
                diagramUuid: diagram.diagramUuid,
                type: DiagramType.VOLTAGE_LEVEL as const,
                name: diagram.name,
                voltageLevelId: diagram.voltageLevelId,
            } as VoltageLevelDiagramParams;
        } else if (diagram.type === DiagramType.SUBSTATION && 'substationId' in diagram) {
            const substationDiag = diagram as any;
            return {
                diagramUuid: diagram.diagramUuid,
                type: DiagramType.SUBSTATION as const,
                name: diagram.name,
                substationId: substationDiag.substationId,
            } as SubstationDiagramParams;
        }
        return {
            diagramUuid: diagram.diagramUuid,
            type: diagram.type,
            name: diagram.name,
        } as VoltageLevelDiagramParams | SubstationDiagramParams;
    }, [diagram]);

    return (
        <DiagramWrapper loading={loading} hasSvg={!!diagram.svg} globalError={globalError}>
            <SingleLineDiagramContent
                diagramParams={diagramParams}
                showInSpreadsheet={showInSpreadsheet}
                studyUuid={studyUuid}
                svg={diagram.svg?.svg ?? undefined}
                svgMetadata={diagram.svg?.metadata as SLDMetadata}
                loadingState={loading}
                diagramSizeSetter={() => {}}
                visible
                onNewVoltageLevelDiagram={openDiagram}
                onNextVoltageLevelDiagram={handleNavigateDiagram}
            />
        </DiagramWrapper>
    );
};
