/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DiagramParams, DiagramParamsDto } from 'components/grid-layout/diagram.type';
import { UUID } from 'crypto';
import { Layout } from 'react-grid-layout';

export type DiagramLayoutParam = DiagramParams & {
    diagramPositions: Record<string, Pick<Layout, 'w' | 'h' | 'x' | 'y'>>;
};

export interface DiagramGridLayout {
    diagramLayouts: DiagramLayoutParam[];
}

type MapDTO = {
    diagramUuid: UUID;
    type: 'map';
};

export type DiagramLayoutDto = (DiagramParamsDto | MapDTO) & {
    diagramPositions: Record<string, Pick<Layout, 'w' | 'h' | 'x' | 'y'>>;
};

export type DiagramGridLayoutDto = {
    diagramLayouts: DiagramLayoutDto[];
};
