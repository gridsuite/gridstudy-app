/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';

import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import TableChartIcon from '@mui/icons-material/TableChart';
import DeleteIcon from '@mui/icons-material/Delete';
import { NestedMenuItem } from 'mui-nested-menu';

import { useIntl } from 'react-intl';
import { equipments } from '../network/network-equipments';
import { useSelector } from 'react-redux';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import { getFeederTypeFromEquipmentType } from 'components/diagrams/diagram-common';
import { isNodeReadOnly } from '../graph/util/model-functions';

const useStyles = makeStyles((theme) => ({
    menuItem: {
        // NestedMenu item manages only label prop of string type
        // It fix paddings itself then we must force this padding
        // to justify menu items texts
        paddingLeft: '12px',
    },
}));

const ViewInSpreadsheetItem = ({
    equipmentType,
    equipmentId,
    itemText,
    handleViewInSpreadsheet,
}) => {
    const classes = useStyles();

    return (
        <MenuItem
            className={classes.menuItem}
            onClick={() => handleViewInSpreadsheet(equipmentType, equipmentId)}
            selected={false}
        >
            <ListItemIcon>
                <TableChartIcon />
            </ListItemIcon>

            <ListItemText
                primary={<Typography noWrap>{itemText}</Typography>}
            />
        </MenuItem>
    );
};

const DeleteEquipmentItem = ({
    equipmentType,
    equipmentId,
    itemText,
    handleDeleteEquipment,
}) => {
    const currentNode = useSelector((state) => state.currentTreeNode);
    const classes = useStyles();

    return (
        <MenuItem
            className={classes.menuItem}
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
        </MenuItem>
    );
};
const ModifyEquipmentItem = ({
    equipmentType,
    equipmentId,
    itemText,
    handleOpenModificationDialog,
}) => {
    const currentNode = useSelector((state) => state.currentTreeNode);
    const classes = useStyles();

    return (
        <MenuItem
            className={classes.menuItem}
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
                className={classes.listItemText}
                primary={<Typography noWrap>{itemText}</Typography>}
            />
        </MenuItem>
    );
};

const ItemViewInForm = ({
    equipmentType,
    equipmentId,
    itemText,
    handleOpenModificationDialog,
}) => {
    const currentNode = useSelector((state) => state.currentTreeNode);
    const classes = useStyles();
    return (
        <MenuItem
            className={classes.menuItem}
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
        </MenuItem>
    );
};

const BaseEquipmentMenu = ({
    equipment,
    equipmentType,
    handleViewInSpreadsheet,
    handleDeleteEquipment,
    handleOpenModificationDialog,
}) => {
    const intl = useIntl();
    const { getNameOrId } = useNameOrId();

    const equipmentsWithBranch = [
        equipments.lines,
        equipments.twoWindingsTransformers,
    ];
    const equipmentsNotDeletable = [
        equipments.lccConverterStations,
        equipments.vscConverterStations,
        equipments.hvdcLines,
    ];

    return (
        <>
            {/* menus for equipment other than substation and voltage level */}
            {equipmentType !== equipments.substations &&
                equipmentType !== equipments.voltageLevels && (
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
            {/* menus for equipment generator and load */}
            {(equipmentType === equipments.generators ||
                equipmentType === equipments.loads) && (
                <ItemViewInForm
                    equipmentId={equipment.id}
                    equipmentType={equipmentType}
                    itemText={intl.formatMessage({
                        id: 'edit',
                    })}
                    handleOpenModificationDialog={handleOpenModificationDialog}
                ></ItemViewInForm>
            )}
            {/* menus for equipment substation */}
            {equipmentType === equipments.substations && equipment && (
                <>
                    {/* menus for the substation */}
                    <NestedMenuItem
                        label={intl.formatMessage({ id: 'ViewOnSpreadsheet' })}
                        parentMenuOpen={true}
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
                                equipmentType={equipments.voltageLevels}
                                equipmentId={voltageLevel.id}
                                itemText={getNameOrId(voltageLevel)}
                                handleViewInSpreadsheet={
                                    handleViewInSpreadsheet
                                }
                            />
                        ))}
                    </NestedMenuItem>
                    <NestedMenuItem
                        label={intl.formatMessage({ id: 'DeleteFromMenu' })}
                        parentMenuOpen={true}
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
                                equipmentType={equipments.voltageLevels}
                                equipmentId={voltageLevel.id}
                                itemText={getNameOrId(voltageLevel)}
                                handleDeleteEquipment={handleDeleteEquipment}
                            />
                        ))}
                    </NestedMenuItem>
                    <NestedMenuItem
                        label={intl.formatMessage({ id: 'ModifyFromMenu' })}
                        parentMenuOpen={true}
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
                                equipmentType={equipments.voltageLevels}
                                equipmentId={voltageLevel.id}
                                itemText={getNameOrId(voltageLevel)}
                                handleOpenModificationDialog={
                                    handleOpenModificationDialog
                                }
                            />
                        ))}
                    </NestedMenuItem>
                </>
            )}

            {/* menus for equipment voltage level */}
            {equipmentType === equipments.voltageLevels && equipment && (
                <>
                    <NestedMenuItem
                        label={intl.formatMessage({ id: 'ViewOnSpreadsheet' })}
                        parentMenuOpen={true}
                    >
                        {/* menus for the substation */}
                        <ViewInSpreadsheetItem
                            key={equipment.substationId}
                            equipmentType={equipments.substations}
                            equipmentId={equipment.substationId}
                            itemText={
                                equipment.substationName ??
                                equipment.substationId
                            }
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />
                        {/* menus for the voltage level */}
                        <ViewInSpreadsheetItem
                            key={equipment.id}
                            equipmentType={equipments.voltageLevels}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />
                    </NestedMenuItem>
                    <NestedMenuItem
                        label={intl.formatMessage({ id: 'DeleteFromMenu' })}
                        parentMenuOpen={true}
                    >
                        {/* menus for the substation */}
                        <DeleteEquipmentItem
                            key={equipment.substationId}
                            equipmentType={equipments.substations}
                            equipmentId={equipment.substationId}
                            itemText={
                                equipment.substationName ??
                                equipment.substationId
                            }
                            handleDeleteEquipment={handleDeleteEquipment}
                        />
                        {/* menus for the voltage level */}
                        <DeleteEquipmentItem
                            key={equipment.id}
                            equipmentType={equipments.voltageLevels}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleDeleteEquipment={handleDeleteEquipment}
                        />
                    </NestedMenuItem>
                    <NestedMenuItem
                        label={intl.formatMessage({ id: 'ModifyFromMenu' })}
                        parentMenuOpen={true}
                    >
                        {/* menus for the substation */}
                        <ModifyEquipmentItem
                            key={equipment.substationId}
                            equipmentType={equipments.substations}
                            equipmentId={equipment.substationId}
                            itemText={
                                equipment.substationName ??
                                equipment.substationId
                            }
                            handleOpenModificationDialog={
                                handleOpenModificationDialog
                            }
                        />
                        {/* menus for the voltage level */}
                        <ModifyEquipmentItem
                            key={equipment.id}
                            equipmentType={equipments.voltageLevels}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleOpenModificationDialog={
                                handleOpenModificationDialog
                            }
                        />
                    </NestedMenuItem>
                </>
            )}
        </>
    );
};

export default BaseEquipmentMenu;
