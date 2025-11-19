/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
    openDiagram as openDiagramAction,
    showInSpreadsheet as showInSpreadsheetAction,
    openNetworkAreaDiagram as openNetworkAreaDiagramAction,
} from '../../../../../redux/slices/workspace-slice';
import { DiagramType } from '../../../../grid-layout/cards/diagrams/diagram.type';
import { EquipmentType } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import type { DiagramConfigPosition } from '../../../../../services/explore';

export const useDiagramHandlers = () => {
    const dispatch = useDispatch();

    const openDiagram = useCallback(
        (id: string, diagramType: DiagramType, extraData?: any) => {
            dispatch(openDiagramAction({ id, diagramType, extraData }));
        },
        [dispatch]
    );

    const showInSpreadsheet = useCallback(
        (equipmentId: string, equipmentType: EquipmentType) => {
            dispatch(showInSpreadsheetAction({ equipmentId, equipmentType }));
        },
        [dispatch]
    );

    const openNetworkAreaDiagram = useCallback(
        (
            name: string,
            nadConfigUuid?: UUID,
            filterUuid?: UUID,
            voltageLevelIds?: string[],
            voltageLevelToExpandIds?: string[],
            voltageLevelToOmitIds?: string[],
            positions?: DiagramConfigPosition[]
        ) => {
            dispatch(
                openNetworkAreaDiagramAction({
                    name,
                    nadConfigUuid,
                    filterUuid,
                    voltageLevelIds,
                    voltageLevelToExpandIds,
                    voltageLevelToOmitIds,
                    positions,
                })
            );
        },
        [dispatch]
    );

    return { openDiagram, showInSpreadsheet, openNetworkAreaDiagram };
};

export const openNadConfigHelper = (openDiagram: any, nadConfigUuid: string) => {
    openDiagram('Network Area Diagram', DiagramType.NETWORK_AREA_DIAGRAM, {
        name: '',
        nadConfigUuid,
        voltageLevelIds: [],
        voltageLevelToExpandIds: [],
        voltageLevelToOmitIds: [],
        positions: [],
    });
};

export const openEquipmentDiagramHelper = (
    openDiagram: any,
    equipment: { id: string; type: EquipmentType | string; voltageLevelId?: string }
) => {
    if (equipment.type === EquipmentType.VOLTAGE_LEVEL || equipment.voltageLevelId) {
        const vlId = equipment.voltageLevelId || equipment.id;
        openDiagram(vlId, DiagramType.VOLTAGE_LEVEL);
    } else if (equipment.type === EquipmentType.SUBSTATION) {
        openDiagram(equipment.id, DiagramType.SUBSTATION);
    }
};
