/*
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { v4 } from 'uuid';
import { Diagram, DiagramParams, DiagramParamsWithoutId, DiagramType } from '../cards/diagrams/diagram.type';
import type { UUID } from 'node:crypto';

export const completeDiagramParamsWithId = (diagramParams: DiagramParamsWithoutId<DiagramParams>): DiagramParams => {
    if (diagramParams.diagramUuid) {
        return diagramParams as DiagramParams;
    }
    return {
        ...diagramParams,
        diagramUuid: v4() as UUID,
    } as DiagramParams;
};

const MAX_NUMBER_OF_NAD_DIAGRAMS = 3;

export const isThereTooManyOpenedNadDiagrams = (diagrams: Record<UUID, Diagram>) => {
    return (
        Object.values(diagrams).filter((diagram) => diagram?.type === DiagramType.NETWORK_AREA_DIAGRAM).length >=
        MAX_NUMBER_OF_NAD_DIAGRAMS
    );
};
