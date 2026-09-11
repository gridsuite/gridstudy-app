/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import Menu from '@mui/material/Menu';
import { getEventType } from '../dialogs/dynamicsimulation/event/model/event.model';
import { useCanModifyEquipment } from './use-can-modify-equipment';
import DynamicSimulationEventMenuItem from './dynamic-simulation/dynamic-simulation-event-menu-item';
import {
    type EquipmentType,
    type ExtendedEquipmentType,
    type MuiStyles,
    PARAM_DEVELOPER_MODE,
} from '@gridsuite/commons-ui';
import { BaseEquipmentMenuProps } from './base-equipment-menu';
import { MenuBranchProps } from './operating-status-menu';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';

const styles = {
    menu: {
        minWidth: '300px',
        maxHeight: '800px',
        overflowY: 'visible',
    },
} as const satisfies MuiStyles;

const withEquipmentMenu =
    (
        BaseMenu: React.ComponentType<BaseEquipmentMenuProps>,
        equipmentType: EquipmentType,
        equipmentSubtype: ExtendedEquipmentType | null,
        menuId: string
    ) =>
    ({
        equipment,
        position,
        handleClose,
        handleViewInSpreadsheet,
        handleDeleteEquipment,
        handleOpenModificationDialog,
        onOpenDynamicSimulationEventDialog,
    }: MenuBranchProps) => {
        const [isDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

        const canModifyEquipment = useCanModifyEquipment();

        const handleOpenDynamicSimulationEventDialog = useCallback(
            (equipmentId: string, equipmentType: EquipmentType, dialogTitle: string) => {
                if (onOpenDynamicSimulationEventDialog) {
                    handleClose();
                    onOpenDynamicSimulationEventDialog(equipmentId, equipmentType, dialogTitle);
                }
            },
            [handleClose, onOpenDynamicSimulationEventDialog]
        );

        return (
            equipment &&
            position && (
                <Menu
                    sx={styles.menu}
                    anchorReference="anchorPosition"
                    anchorPosition={{
                        top: position[1],
                        left: position[0],
                    }}
                    id={menuId}
                    open={true}
                    onClose={handleClose}
                >
                    <BaseMenu
                        equipment={equipment}
                        equipmentType={equipmentType}
                        equipmentSubtype={equipmentSubtype}
                        handleViewInSpreadsheet={handleViewInSpreadsheet}
                        handleDeleteEquipment={handleDeleteEquipment}
                        handleOpenModificationDialog={handleOpenModificationDialog}
                    />
                    {isDeveloperMode && getEventType(equipmentType) && (
                        <DynamicSimulationEventMenuItem
                            equipmentId={equipment.id}
                            equipmentType={equipmentType}
                            onOpenDynamicSimulationEventDialog={handleOpenDynamicSimulationEventDialog}
                            disabled={!canModifyEquipment}
                        />
                    )}
                </Menu>
            )
        );
    };

export default withEquipmentMenu;
