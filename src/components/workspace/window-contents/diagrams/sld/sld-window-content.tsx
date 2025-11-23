/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DiagramType } from '../../../../grid-layout/cards/diagrams/diagram.type';
import type {
    VoltageLevelDiagramParams,
    SubstationDiagramParams,
} from '../../../../grid-layout/cards/diagrams/diagram.type';
import SingleLineDiagramContent from '../../../../grid-layout/cards/diagrams/singleLineDiagram/single-line-diagram-content';
import { navigateSLD } from '../../../../../redux/slices/workspace-slice';
import { SLDMetadata } from '@powsybl/network-viewer';
import type { UUID } from 'node:crypto';
import { useSldDiagram } from './use-sld-diagram';
import { DiagramWrapper } from '../diagram-wrapper';
import { useDiagramNavigation } from '../common/use-diagram-navigation';
import { selectWindow } from '../../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../../redux/store';
import { SLDWindowMetadata } from 'components/workspace/types/workspace.types';

interface SldWindowContentProps {
    windowId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const SldWindowContent = ({
    windowId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
}: SldWindowContentProps) => {
    const dispatch = useDispatch();
    const window = useSelector((state: RootState) => selectWindow(state, windowId));
    const diagramMetadata = window?.metadata as SLDWindowMetadata | undefined;

    const { diagram, loading, globalError } = useSldDiagram({
        diagramMetadata: diagramMetadata!,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
    });

    const { handleShowInSpreadsheet, handleOpenDiagram } = useDiagramNavigation();

    const handleNavigateDiagram = useCallback(
        (params: VoltageLevelDiagramParams | SubstationDiagramParams) => {
            const id = params.type === DiagramType.VOLTAGE_LEVEL ? params.voltageLevelId : params.substationId;
            if (id) {
                dispatch(navigateSLD({ windowId, id, diagramType: params.type }));
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

    if (!diagramMetadata) {
        return null;
    }

    return (
        <DiagramWrapper loading={loading} hasSvg={!!diagram.svg} globalError={globalError}>
            <SingleLineDiagramContent
                diagramParams={diagramParams}
                showInSpreadsheet={handleShowInSpreadsheet}
                studyUuid={studyUuid}
                windowId={windowId}
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
