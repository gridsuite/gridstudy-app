/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
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
import { useSelector } from 'react-redux';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import { getFeederTypeFromEquipmentType } from 'components/diagrams/diagram-common';
import { fetchNetworkElementInfos } from '../../utils/rest-api';
import { isNodeReadOnly } from '../graph/util/model-functions';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../utils/equipment-types';

const useStyles = makeStyles((theme) => ({
    menuItem: {
        padding: '0px',
        margin: '7px',
    },
    listItemText: {
        fontSize: 12,
        padding: '0px',
        margin: '4px',
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
                className={classes.listItemText}
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
                className={classes.listItemText}
                primary={<Typography noWrap>{itemText}</Typography>}
            ></ListItemText>
        </MenuItem>
    );
};

const BaseEquipmentMenu = ({
    equipmentId,
    equipmentType,
    handleViewInSpreadsheet,
    handleDeleteEquipment,
    handleOpenModificationDialog,
}) => {
    const intl = useIntl();
    const { getNameOrId } = useNameOrId();
    const [equipment, setEquipment] = useState();
    const [equipmentSubstationNameOrId, setEquipmentSubstationNameOrId] =
        useState();

    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);

    // Returns a promise
    //TODO ideally we should have the equipment data from the props instead of doing a fetch,
    // we can have it from mapEquipments in the map and metadata in the SVG
    const getEquipment = useCallback(
        (equipmentType, equipmentId) => {
            if (!studyUuid || !currentNode) {
                return Promise.reject('no study or node selected');
            } else if (equipmentType === EQUIPMENT_TYPES.SUBSTATION.name) {
                return fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    EQUIPMENT_TYPES.SUBSTATION.type,
                    EQUIPMENT_INFOS_TYPES.LIST.type,
                    equipmentId,
                    true
                );
            } else if (equipmentType === EQUIPMENT_TYPES.VOLTAGE_LEVEL.name) {
                return fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    EQUIPMENT_TYPES.VOLTAGE_LEVEL.type,
                    EQUIPMENT_INFOS_TYPES.LIST.type,
                    equipmentId,
                    true
                );
            } else {
                return Promise.reject('not a substation or a voltage level');
            }
        },
        [studyUuid, currentNode]
    );

    const equipmentsWithBranch = [
        EQUIPMENT_TYPES.LINE.type,
        EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type,
    ];
    const equipmentsNotDeletable = [
        EQUIPMENT_TYPES.LCC_CONVERTER_STATION.type,
        EQUIPMENT_TYPES.VSC_CONVERTER_STATION.type,
        EQUIPMENT_TYPES.HVDC_LINE.type,
    ];

    useEffect(() => {
        getEquipment(equipmentType, equipmentId)
            .then((equipment) => {
                setEquipment(equipment);
                if (equipmentType === EQUIPMENT_TYPES.VOLTAGE_LEVEL.name) {
                    setEquipmentSubstationNameOrId(
                        equipment.substationName ?? equipment.substationId
                    );
                }
            })
            .catch((reason) =>
                console.log(
                    'We did not fetch the equipment of contextual menu because ' +
                        reason
                )
            );
    }, [getEquipment, equipmentType, equipmentId]);

    return (
        <>
            {/* menus for equipment other than substation and voltage level */}
            {equipmentType !== EQUIPMENT_TYPES.SUBSTATION.name &&
                equipmentType !== EQUIPMENT_TYPES.VOLTAGE_LEVEL.name && (
                    <>
                        <ViewInSpreadsheetItem
                            key="ViewOnSpreadsheet"
                            equipmentType={equipmentType}
                            equipmentId={equipmentId}
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
                                    equipmentId={equipmentId}
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
            {(equipmentType === EQUIPMENT_TYPES.GENERATOR.type ||
                equipmentType === EQUIPMENT_TYPES.LOAD.type) && (
                <ItemViewInForm
                    equipmentId={equipmentId}
                    equipmentType={equipmentType}
                    itemText={intl.formatMessage({
                        id: 'edit',
                    })}
                    handleOpenModificationDialog={handleOpenModificationDialog}
                ></ItemViewInForm>
            )}
            {/* menus for equipment substation */}
            {equipmentType === EQUIPMENT_TYPES.SUBSTATION.name && equipment && (
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
                                equipmentType={
                                    EQUIPMENT_TYPES.VOLTAGE_LEVEL.name
                                }
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
                                equipmentType={
                                    EQUIPMENT_TYPES.VOLTAGE_LEVEL.name
                                }
                                equipmentId={voltageLevel.id}
                                itemText={getNameOrId(voltageLevel)}
                                handleDeleteEquipment={handleDeleteEquipment}
                            />
                        ))}
                    </NestedMenuItem>
                </>
            )}

            {/* menus for equipment voltage level */}
            {equipmentType === EQUIPMENT_TYPES.VOLTAGE_LEVEL.name &&
                equipment && (
                    <>
                        <NestedMenuItem
                            label={intl.formatMessage({
                                id: 'ViewOnSpreadsheet',
                            })}
                            parentMenuOpen={true}
                        >
                            {/* menus for the substation */}
                            <ViewInSpreadsheetItem
                                key={equipment.substationId}
                                equipmentType={EQUIPMENT_TYPES.SUBSTATION.name}
                                equipmentId={equipment.substationId}
                                itemText={equipmentSubstationNameOrId}
                                handleViewInSpreadsheet={
                                    handleViewInSpreadsheet
                                }
                            />
                            {/* menus for the voltage level */}
                            <ViewInSpreadsheetItem
                                key={equipment.id}
                                equipmentType={
                                    EQUIPMENT_TYPES.VOLTAGE_LEVEL.name
                                }
                                equipmentId={equipment.id}
                                itemText={getNameOrId(equipment)}
                                handleViewInSpreadsheet={
                                    handleViewInSpreadsheet
                                }
                            />
                        </NestedMenuItem>
                        <NestedMenuItem
                            label={intl.formatMessage({ id: 'DeleteFromMenu' })}
                            parentMenuOpen={true}
                        >
                            {/* menus for the substation */}
                            <DeleteEquipmentItem
                                key={equipment.substationId}
                                equipmentType={EQUIPMENT_TYPES.SUBSTATION.name}
                                equipmentId={equipment.substationId}
                                itemText={equipmentSubstationNameOrId}
                                handleDeleteEquipment={handleDeleteEquipment}
                            />
                            {/* menus for the voltage level */}
                            <DeleteEquipmentItem
                                key={equipment.id}
                                equipmentType={
                                    EQUIPMENT_TYPES.VOLTAGE_LEVEL.name
                                }
                                equipmentId={equipment.id}
                                itemText={getNameOrId(equipment)}
                                handleDeleteEquipment={handleDeleteEquipment}
                            />
                        </NestedMenuItem>
                    </>
                )}
        </>
    );
};

export default BaseEquipmentMenu;
