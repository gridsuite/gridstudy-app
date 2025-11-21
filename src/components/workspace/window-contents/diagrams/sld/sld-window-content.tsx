/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { DiagramType } from '../../../../grid-layout/cards/diagrams/diagram.type';
import type {
    VoltageLevelDiagramParams,
    SubstationDiagramParams,
} from '../../../../grid-layout/cards/diagrams/diagram.type';
import SingleLineDiagramContent from '../../../../grid-layout/cards/diagrams/singleLineDiagram/single-line-diagram-content';
import { DiagramWindowData } from '../../../types/workspace.types';
import { updateWindowMetadata, navigateDiagram } from '../../../../../redux/slices/workspace-slice';
import { SLDMetadata } from '@powsybl/network-viewer';
import type { UUID } from 'node:crypto';
import { useSldDiagram } from './use-sld-diagram';
import { DiagramWrapper } from '../diagram-wrapper';
import { useDiagramTitle } from '../../../../grid-layout/hooks/use-diagram-title';
import { useDiagramNavigation } from '../common/use-diagram-navigation';

interface SldWindowContentProps {
    diagramData: DiagramWindowData;
    windowId: UUID;
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

    const { diagram, loading, globalError } = useSldDiagram({
        diagramData,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
    });

    const getDiagramTitle = useDiagramTitle();
    const { handleShowInSpreadsheet, handleOpenDiagram } = useDiagramNavigation();

    // Update window title when diagram changes
    useEffect(() => {
        const newTitle = getDiagramTitle(diagram, diagram.svg ?? undefined);
        dispatch(updateWindowMetadata({ windowId, title: newTitle }));
    }, [diagram, dispatch, getDiagramTitle, windowId]);

    const handleNavigateDiagram = useCallback(
        (params: VoltageLevelDiagramParams | SubstationDiagramParams) => {
            const id = params.type === DiagramType.VOLTAGE_LEVEL ? params.voltageLevelId : params.substationId;
            if (id) {
                dispatch(navigateDiagram({ windowId, id, diagramType: params.type }));
            }
        },
        [dispatch, windowId]
    );

    const diagramParams = useMemo(() => {
        if (diagram.type === DiagramType.VOLTAGE_LEVEL && 'voltageLevelId' in diagram) {
            return {
                type: DiagramType.VOLTAGE_LEVEL as const,
                voltageLevelId: diagram.voltageLevelId,
            } as VoltageLevelDiagramParams;
        } else if (diagram.type === DiagramType.SUBSTATION && 'substationId' in diagram) {
            const substationDiag = diagram as any;
            return {
                type: DiagramType.SUBSTATION as const,
                substationId: substationDiag.substationId,
            } as SubstationDiagramParams;
        }
        return {
            type: diagram.type,
        } as VoltageLevelDiagramParams | SubstationDiagramParams;
    }, [diagram]);

    return (
        <DiagramWrapper loading={loading} hasSvg={!!diagram.svg} globalError={globalError}>
            <SingleLineDiagramContent
                diagramParams={diagramParams}
                showInSpreadsheet={handleShowInSpreadsheet}
                studyUuid={studyUuid}
                svg={diagram.svg?.svg ?? undefined}
                svgMetadata={diagram.svg?.metadata as SLDMetadata}
                loadingState={loading}
                visible
                onNewVoltageLevelDiagram={handleOpenDiagram}
                onNextVoltageLevelDiagram={handleNavigateDiagram}
            />
        </DiagramWrapper>
    );
};
