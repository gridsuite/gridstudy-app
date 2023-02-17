/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import MenuItem from '@mui/material/MenuItem';

import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import TableChartIcon from '@mui/icons-material/TableChart';
import DeleteIcon from '@mui/icons-material/Delete';
import { NestedMenuItem } from 'mui-nested-menu';

import { useIntl } from 'react-intl';
import { equipments } from '../network/network-equipments';
import { useSelector } from 'react-redux';
import { useNameOrId } from '../util/equipmentInfosHandler';
import { deleteEquipment } from 'utils/rest-api';
import { getFeederTypeFromEquipmentType } from 'components/diagrams/diagram-common';

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

const ItemViewInSpreadsheet = ({
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

const ItemDeleteEquipment = ({
    equipmentType,
    equipmentId,
    itemText,
    handleViewInSpreadsheet,
}) => {
    const classes = useStyles();

    return (
        <MenuItem
            className={classes.menuItem}
            onClick={() =>
                handleViewInSpreadsheet(
                    getFeederTypeFromEquipmentType(equipmentType),
                    equipmentId
                )
            }
            selected={false}
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

const BaseEquipmentMenu = ({
    equipmentId,
    equipmentType,
    handleViewInSpreadsheet,
    handleDeleteEquipment,
}) => {
    const intl = useIntl();

    const network = useSelector((state) => state.network);

    function getEquipment(equipmentType, equipmentId) {
        if (equipmentType === equipments.substations) {
            return network.getSubstation(equipmentId);
        } else if (equipmentType === equipments.voltageLevels) {
            return network.getVoltageLevel(equipmentId);
        } else {
            return null;
        }
    }
    const equipment = getEquipment(equipmentType, equipmentId);
    const { getNameOrId } = useNameOrId();
    return (
        <>
            {/* menus for equipment other than substation and voltage level */}
            {equipmentType !== equipments.substations &&
                equipmentType !== equipments.voltageLevels && (
                    <ItemViewInSpreadsheet
                        key="ViewOnSpreadsheet"
                        equipmentType={equipmentType}
                        equipmentId={equipmentId}
                        itemText={intl.formatMessage({
                            id: 'ViewOnSpreadsheet',
                        })}
                        handleViewInSpreadsheet={handleViewInSpreadsheet}
                    />
                )}

            {/* menus for equipment substation */}
            {equipmentType === equipments.substations && equipment && (
                <>
                    {/* menus for the substation */}
                    <NestedMenuItem
                        label={intl.formatMessage({ id: 'ViewOnSpreadsheet' })}
                        parentMenuOpen={true}
                    >
                        <ItemViewInSpreadsheet
                            key={equipment.id}
                            equipmentType={equipmentType}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />

                        {equipment.voltageLevels.map((voltageLevel) => (
                            // menus for all voltage levels in the substation
                            <ItemViewInSpreadsheet
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
                    <NestedMenuItem label="Delete" parentMenuOpen={true}>
                        <ItemDeleteEquipment
                            key={equipment.id}
                            equipmentType={equipmentType}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleDeleteEquipment={handleDeleteEquipment}
                        />

                        {equipment.voltageLevels.map((voltageLevel) => (
                            // menus for all voltage levels in the substation
                            <ItemDeleteEquipment
                                key={voltageLevel.id}
                                equipmentType={equipments.voltageLevels}
                                equipmentId={voltageLevel.id}
                                itemText={getNameOrId(voltageLevel)}
                                handleDeleteEquipment={handleDeleteEquipment}
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
                        <ItemViewInSpreadsheet
                            key={equipment.substationId}
                            equipmentType={equipments.substations}
                            equipmentId={equipment.substationId}
                            itemText={getNameOrId(
                                network.getSubstation(equipment.substationId)
                            )}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />
                        {/* menus for the voltage level */}
                        <ItemViewInSpreadsheet
                            key={equipment.id}
                            equipmentType={equipments.voltageLevels}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />
                    </NestedMenuItem>
                </>
            )}
        </>
    );
};

export default BaseEquipmentMenu;
