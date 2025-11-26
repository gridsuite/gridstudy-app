/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { showInSpreadsheet, openSLD } from '../../../../redux/slices/workspace-slice';
import { PanelType } from '../../../workspace/types/workspace.types';
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

    const handleOpenVoltageLevelDiagram = useCallback(
        (voltageLevelId: string) => {
            dispatch(openSLD({ id: voltageLevelId, panelType: PanelType.SLD_VOLTAGE_LEVEL }));
        },
        [dispatch]
    );

    return {
        handleShowInSpreadsheet,
        handleOpenVoltageLevelDiagram,
    };
};
