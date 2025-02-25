/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import Menu from '@mui/material/Menu';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import { getEventType } from '../dialogs/dynamicsimulation/event/model/event.model';
import { useSelector } from 'react-redux';
import { useIsAnyNodeBuilding } from '../utils/is-any-node-building-hook';
import { isNodeBuilt, isNodeReadOnly } from '../graph/util/model-functions';
import DynamicSimulationEventMenuItem from './dynamic-simulation/dynamic-simulation-event-menu-item';
import { AppState } from 'redux/reducer';
import { EquipmentType } from '@gridsuite/commons-ui';
import { BaseEquipmentMenuProps } from './base-equipment-menu';
import { MenuBranchProps } from './operating-status-menu';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';

const styles = {
    menu: {
        minWidth: '300px',
        maxHeight: '800px',
        overflowY: 'visible',
    },
};

const withEquipmentMenu =
    (BaseMenu: React.ComponentType<BaseEquipmentMenuProps>, equipmentType: EquipmentType, menuId: string) =>
    ({
        equipment,
        position,
        handleClose,
        handleViewInSpreadsheet,
        handleDeleteEquipment,
        handleOpenModificationDialog,
        onOpenDynamicSimulationEventDialog,
    }: MenuBranchProps) => {
        const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

        // to check is node editable
        const currentNode = useSelector((state: AppState) => state.currentTreeNode);
        const isAnyNodeBuilding = useIsAnyNodeBuilding();
        const isNodeEditable = useMemo(
            () => isNodeBuilt(currentNode) && !isNodeReadOnly(currentNode) && !isAnyNodeBuilding,
            [currentNode, isAnyNodeBuilding]
        );

        const handleOpenDynamicSimulationEventDialog = useCallback(
            (equipmentId: string, equipmentType: EquipmentType | null, dialogTitle: string) => {
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
                        handleViewInSpreadsheet={handleViewInSpreadsheet}
                        handleDeleteEquipment={handleDeleteEquipment}
                        handleOpenModificationDialog={handleOpenModificationDialog}
                    />
                    {enableDeveloperMode && getEventType(equipmentType) && (
                        <DynamicSimulationEventMenuItem
                            equipmentId={equipment.id}
                            equipmentType={equipmentType}
                            onOpenDynamicSimulationEventDialog={handleOpenDynamicSimulationEventDialog}
                            disabled={!isNodeEditable}
                        />
                    )}
                </Menu>
            )
        );
    };

export default withEquipmentMenu;
