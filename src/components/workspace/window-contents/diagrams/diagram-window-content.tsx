/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DiagramType } from '../../../grid-layout/cards/diagrams/diagram.type';
import { DiagramWindowData } from '../../types/workspace.types';
import type { UUID } from 'node:crypto';
import { NadWindowContent } from './nad/nad-window-content';
import { SldWindowContent } from './sld/sld-window-content';

interface DiagramWindowContentProps {
    diagramData: DiagramWindowData;
    windowId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const DiagramWindowContent = ({
    diagramData,
    windowId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
}: DiagramWindowContentProps) => {
    const isNad = diagramData.diagramType === DiagramType.NETWORK_AREA_DIAGRAM;

    if (isNad) {
        return (
            <NadWindowContent
                diagramData={diagramData}
                windowId={windowId}
                studyUuid={studyUuid}
                currentNodeId={currentNodeId}
                currentRootNetworkUuid={currentRootNetworkUuid}
            />
        );
    }

    return (
        <SldWindowContent
            diagramData={diagramData}
            windowId={windowId}
            studyUuid={studyUuid}
            currentNodeId={currentNodeId}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    );
};
