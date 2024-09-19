/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo } from 'react';
import Menu from '@mui/material/Menu';
import { useParameterState } from '../dialogs/parameters/parameters';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import { getEventType } from '../dialogs/dynamicsimulation/event/model/event.model';
import { useSelector } from 'react-redux';
import { useIsAnyNodeBuilding } from '../utils/is-any-node-building-hook';
import { isNodeBuilt, isNodeReadOnly } from '../graph/util/model-functions';
import DynamicSimulationEventMenuItem from './dynamic-simulation/dynamic-simulation-event-menu-item';

const styles = {
    menu: {
        minWidth: '300px',
        maxHeight: '800px',
        overflowY: 'visible',
    },
};

const withEquipmentMenu =
    (BaseMenu, menuId, equipmentType) =>
    ({
        equipment,
        position,
        handleClose,
        handleViewInSpreadsheet,
        handleDeleteEquipment,
        handleOpenModificationDialog,
        onOpenDynamicSimulationEventDialog,
    }) => {
        const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

        // to check is node editable
        const currentNode = useSelector((state) => state.currentTreeNode);
        const isAnyNodeBuilding = useIsAnyNodeBuilding();
        const isNodeEditable = useMemo(
            () => isNodeBuilt(currentNode) && !isNodeReadOnly(currentNode) && !isAnyNodeBuilding,
            [currentNode, isAnyNodeBuilding]
        );

        const handleOpenDynamicSimulationEventDialog = useCallback(
            (equipmentId, equipmentType, dialogTitle) => {
                handleClose();
                onOpenDynamicSimulationEventDialog(equipmentId, equipmentType, dialogTitle);
            },
            [handleClose, onOpenDynamicSimulationEventDialog]
        );

        return (
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
        );
    };

export default withEquipmentMenu;
