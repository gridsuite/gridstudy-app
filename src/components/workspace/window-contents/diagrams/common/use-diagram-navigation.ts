/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { showInSpreadsheet, openDiagram } from '../../../../../redux/slices/workspace-slice';
import type {
    VoltageLevelDiagramParams,
    SubstationDiagramParams,
} from '../../../../grid-layout/cards/diagrams/diagram.type';
import { DiagramType } from '../../../../grid-layout/cards/diagrams/diagram.type';
import { EquipmentType } from '@gridsuite/commons-ui';

export const useDiagramNavigation = () => {
    const dispatch = useDispatch();

    const handleShowInSpreadsheet = useCallback(
        (equipment: { equipmentId: string | null; equipmentType: EquipmentType | null }) => {
            if (equipment.equipmentId && equipment.equipmentType) {
                dispatch(
                    showInSpreadsheet({ equipmentId: equipment.equipmentId, equipmentType: equipment.equipmentType })
                );
            }
        },
        [dispatch]
    );

    const handleOpenDiagram = useCallback(
        (params: VoltageLevelDiagramParams | SubstationDiagramParams) => {
            const id = params.type === DiagramType.VOLTAGE_LEVEL ? params.voltageLevelId : params.substationId;
            if (id) {
                dispatch(openDiagram({ id, diagramType: params.type }));
            }
        },
        [dispatch]
    );

    return {
        handleShowInSpreadsheet,
        handleOpenDiagram,
    };
};
