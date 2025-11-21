/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { openDiagram, showInSpreadsheet } from '../../../../../redux/slices/workspace-slice';
import { DiagramType } from '../../../../grid-layout/cards/diagrams/diagram.type';
import type { UUID } from 'node:crypto';

export const openSLD = (id: string, type: DiagramType.VOLTAGE_LEVEL | DiagramType.SUBSTATION) =>
    openDiagram({ id, diagramType: type });

export const openNAD = (
    name: string,
    options?: { nadConfigUuid?: UUID; filterUuid?: UUID; initialVoltageLevelIds?: string[] }
) =>
    openDiagram({
        id: name,
        diagramType: DiagramType.NETWORK_AREA_DIAGRAM,
        extraData: {
            name,
            ...options,
        },
    });

export { showInSpreadsheet };
