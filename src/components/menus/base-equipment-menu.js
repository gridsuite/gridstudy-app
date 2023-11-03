/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';

import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import TableChartIcon from '@mui/icons-material/TableChart';
import DeleteIcon from '@mui/icons-material/Delete';

import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import { getFeederTypeFromEquipmentType } from 'components/diagrams/diagram-common';
import { isNodeReadOnly } from '../graph/util/model-functions';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import {
    CustomMenuItem,
    CustomNestedMenuItem,
} from '../utils/custom-nested-menu';

const ViewInSpreadsheetItem = ({
    equipmentType,
    equipmentId,
    itemText,
    handleViewInSpreadsheet,
}) => {
    return (
        <CustomMenuItem
            hasIcon
            onClick={() => handleViewInSpreadsheet(equipmentType, equipmentId)}
            selected={false}
        >
            <ListItemIcon>
                <TableChartIcon />
            </ListItemIcon>

            <ListItemText
                primary={<Typography noWrap>{itemText}</Typography>}
            />
        </CustomMenuItem>
    );
};

const DeleteEquipmentItem = ({
    equipmentType,
    equipmentId,
    itemText,
    handleDeleteEquipment,
}) => {
    const currentNode = useSelector((state) => state.currentTreeNode);

    return (
        <CustomMenuItem
            hasIcon
            onClick={() =>
                handleDeleteEquipment(
                    getFeederTypeFromEquipmentType(equipmentType),
                    equipmentId
                )
            }
            selected={false}
            disabled={isNodeReadOnly(currentNode)}
        >
            <ListItemIcon>
                <DeleteIcon />
            </ListItemIcon>

            <ListItemText
                primary={<Typography noWrap>{itemText}</Typography>}
            />
        </CustomMenuItem>
    );
};
const ModifyEquipmentItem = ({
    equipmentType,
    equipmentId,
    itemText,
    handleOpenModificationDialog,
}) => {
    const currentNode = useSelector((state) => state.currentTreeNode);

    return (
        <CustomMenuItem
            hasIcon
            onClick={() =>
                handleOpenModificationDialog(
                    equipmentId,
                    getFeederTypeFromEquipmentType(equipmentType)
                )
            }
            selected={false}
            disabled={isNodeReadOnly(currentNode)}
        >
            <ListItemIcon>
                <EditIcon />
            </ListItemIcon>

            <ListItemText
                primary={<Typography noWrap>{itemText}</Typography>}
            />
        </CustomMenuItem>
    );
};

const ItemViewInForm = ({
    equipmentType,
    equipmentId,
    itemText,
    handleOpenModificationDialog,
}) => {
    const currentNode = useSelector((state) => state.currentTreeNode);

    return (
        <CustomMenuItem
            hasIcon
            onClick={() =>
                handleOpenModificationDialog(equipmentId, equipmentType)
            }
            disabled={isNodeReadOnly(currentNode)}
        >
            <ListItemIcon>
                <EditIcon></EditIcon>
            </ListItemIcon>
            <ListItemText
                primary={<Typography noWrap>{itemText}</Typography>}
            ></ListItemText>
        </CustomMenuItem>
    );
};

const BaseEquipmentMenu = ({
    equipment,
    equipmentType,
    handleViewInSpreadsheet,
    handleDeleteEquipment,
    handleOpenModificationDialog,
}) => {
    const [openParentId, setOpenParentId] = useState(undefined);
    const intl = useIntl();
    const { getNameOrId } = useNameOrId();

    const equipmentsWithBranch = [
        EQUIPMENT_TYPES.LINE,
        EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
    ];
    const equipmentsNotDeletable = [
        EQUIPMENT_TYPES.LCC_CONVERTER_STATION,
        EQUIPMENT_TYPES.VSC_CONVERTER_STATIO,
    ];

    return (
        <>
            {/* menus for equipment other than substation and voltage level */}
            {equipmentType !== EQUIPMENT_TYPES.SUBSTATION &&
                equipmentType !== EQUIPMENT_TYPES.VOLTAGE_LEVEL && (
                    <>
                        <ViewInSpreadsheetItem
                            key="ViewOnSpreadsheet"
                            equipmentType={equipmentType}
                            equipmentId={equipment.id}
                            itemText={intl.formatMessage({
                                id: 'ViewOnSpreadsheet',
                            })}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />
                        {
                            // Delete button is already in MenuBranch for equipmentsWithBranch
                            // equipmentsNotDeletable deletion is not implemented yet
                            !(
                                equipmentsWithBranch.includes(equipmentType) ||
                                equipmentsNotDeletable.includes(equipmentType)
                            ) && (
                                <DeleteEquipmentItem
                                    key="DeleteFromMenu"
                                    equipmentType={equipmentType}
                                    equipmentId={equipment.id}
                                    itemText={intl.formatMessage({
                                        id: 'DeleteFromMenu',
                                    })}
                                    handleDeleteEquipment={
                                        handleDeleteEquipment
                                    }
                                />
                            )
                        }
                    </>
                )}
            {/* menus for equipment generator, load and shunt compensator */}
            {(equipmentType === EQUIPMENT_TYPES.GENERATOR ||
                equipmentType === EQUIPMENT_TYPES.BATTERY ||
                equipmentType === EQUIPMENT_TYPES.SHUNT_COMPENSATOR ||
                equipmentType === EQUIPMENT_TYPES.LOAD) && (
                <ItemViewInForm
                    equipmentId={equipment.id}
                    equipmentType={equipmentType}
                    itemText={intl.formatMessage({
                        id: 'ModifyFromMenu',
                    })}
                    handleOpenModificationDialog={handleOpenModificationDialog}
                ></ItemViewInForm>
            )}
            {/* menus for equipment substation */}
            {equipmentType === EQUIPMENT_TYPES.SUBSTATION && equipment && (
                <>
                    {/* menus for the substation */}
                    <CustomNestedMenuItem
                        label={intl.formatMessage({ id: 'ViewOnSpreadsheet' })}
                    >
                        <ViewInSpreadsheetItem
                            key={equipment.id}
                            equipmentType={equipmentType}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />

                        {equipment.voltageLevels.map((voltageLevel) => (
                            // menus for all voltage levels in the substation
                            <ViewInSpreadsheetItem
                                key={voltageLevel.id}
                                equipmentType={EQUIPMENT_TYPES.VOLTAGE_LEVEL}
                                equipmentId={voltageLevel.id}
                                itemText={getNameOrId(voltageLevel)}
                                handleViewInSpreadsheet={
                                    handleViewInSpreadsheet
                                }
                            />
                        ))}
                    </CustomNestedMenuItem>
                    <CustomNestedMenuItem
                        label={intl.formatMessage({ id: 'DeleteFromMenu' })}
                    >
                        <DeleteEquipmentItem
                            key={equipment.id}
                            equipmentType={equipmentType}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleDeleteEquipment={handleDeleteEquipment}
                        />

                        {equipment.voltageLevels.map((voltageLevel) => (
                            // menus for all voltage levels in the substation
                            <DeleteEquipmentItem
                                key={voltageLevel.id}
                                equipmentType={EQUIPMENT_TYPES.VOLTAGE_LEVEL}
                                equipmentId={voltageLevel.id}
                                itemText={getNameOrId(voltageLevel)}
                                handleDeleteEquipment={handleDeleteEquipment}
                            />
                        ))}
                    </CustomNestedMenuItem>
                    <CustomNestedMenuItem
                        key={'ModifyFromMenu'}
                        label={intl.formatMessage({ id: 'ModifyFromMenu' })}
                    >
                        {/* menus for the substation */}
                        <ModifyEquipmentItem
                            key={equipment.id}
                            equipmentType={equipmentType}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleOpenModificationDialog={
                                handleOpenModificationDialog
                            }
                        />
                        {/* menus for the voltage level */}
                        {equipment.voltageLevels.map((voltageLevel) => (
                            // menus for all voltage levels in the substation
                            <ModifyEquipmentItem
                                key={voltageLevel.id}
                                equipmentType={EQUIPMENT_TYPES.VOLTAGE_LEVEL}
                                equipmentId={voltageLevel.id}
                                itemText={getNameOrId(voltageLevel)}
                                handleOpenModificationDialog={
                                    handleOpenModificationDialog
                                }
                            />
                        ))}
                    </CustomNestedMenuItem>
                </>
            )}

            {/* menus for equipment voltage level */}
            {equipmentType === EQUIPMENT_TYPES.VOLTAGE_LEVEL && equipment && (
                <>
                    <CustomNestedMenuItem
                        key={'ViewOnSpreadsheet'}
                        label={intl.formatMessage({
                            id: 'ViewOnSpreadsheet',
                        })}
                    >
                        {/* menus for the substation */}
                        <ViewInSpreadsheetItem
                            key={equipment.substationId}
                            equipmentType={EQUIPMENT_TYPES.SUBSTATION}
                            equipmentId={equipment.substationId}
                            itemText={getNameOrId({
                                name: equipment.substationName,
                                id: equipment.substationId,
                            })}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />
                        {/* menus for the voltage level */}
                        <ViewInSpreadsheetItem
                            key={equipment.id}
                            equipmentType={EQUIPMENT_TYPES.VOLTAGE_LEVEL}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />
                    </CustomNestedMenuItem>
                    <CustomNestedMenuItem
                        key={'DeleteFromMenu'}
                        label={intl.formatMessage({ id: 'DeleteFromMenu' })}
                    >
                        {/* menus for the substation */}
                        <DeleteEquipmentItem
                            key={equipment.substationId}
                            equipmentType={EQUIPMENT_TYPES.SUBSTATION}
                            equipmentId={equipment.substationId}
                            itemText={getNameOrId({
                                name: equipment.substationName,
                                id: equipment.substationId,
                            })}
                            handleDeleteEquipment={handleDeleteEquipment}
                        />
                        {/* menus for the voltage level */}
                        <DeleteEquipmentItem
                            key={equipment.id}
                            equipmentType={EQUIPMENT_TYPES.VOLTAGE_LEVEL}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleDeleteEquipment={handleDeleteEquipment}
                        />
                    </CustomNestedMenuItem>
                    <CustomNestedMenuItem
                        key={'ModifyFromMenu'}
                        label={intl.formatMessage({ id: 'ModifyFromMenu' })}
                    >
                        {/* menus for the substation */}
                        <ModifyEquipmentItem
                            key={equipment.substationId}
                            equipmentType={EQUIPMENT_TYPES.SUBSTATION}
                            equipmentId={equipment.substationId}
                            itemText={getNameOrId({
                                name: equipment.substationName,
                                id: equipment.substationId,
                            })}
                            handleOpenModificationDialog={
                                handleOpenModificationDialog
                            }
                        />
                        {/* menus for the voltage level */}
                        <ModifyEquipmentItem
                            key={equipment.id}
                            equipmentType={EQUIPMENT_TYPES.VOLTAGE_LEVEL}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleOpenModificationDialog={
                                handleOpenModificationDialog
                            }
                        />
                    </CustomNestedMenuItem>
                </>
            )}
        </>
    );
};

export default BaseEquipmentMenu;
