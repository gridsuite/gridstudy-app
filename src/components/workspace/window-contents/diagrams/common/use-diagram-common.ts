/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { DiagramType } from '../../../../grid-layout/cards/diagrams/diagram.type';
import type {
    VoltageLevelDiagramParams,
    SubstationDiagramParams,
} from '../../../../grid-layout/cards/diagrams/diagram.type';
import { EquipmentType } from '@gridsuite/commons-ui';
import { useDiagramHandlers } from './use-diagram-handlers';

export const useDiagramCommon = () => {
    const { showInSpreadsheet: storeShowInSpreadsheet, openDiagram: storeOpenDiagram } = useDiagramHandlers();

    const showInSpreadsheet = useCallback(
        (equipment: { equipmentId: string | null; equipmentType: EquipmentType | null }) => {
            if (equipment.equipmentId && equipment.equipmentType) {
                storeShowInSpreadsheet(equipment.equipmentId, equipment.equipmentType);
            }
        },
        [storeShowInSpreadsheet]
    );

    const openDiagram = useCallback(
        (params: VoltageLevelDiagramParams | SubstationDiagramParams) => {
            const id = params.type === DiagramType.VOLTAGE_LEVEL ? params.voltageLevelId : params.substationId;
            if (id) {
                storeOpenDiagram(id, params.type);
            }
        },
        [storeOpenDiagram]
    );

    return {
        showInSpreadsheet,
        openDiagram,
    };
};
