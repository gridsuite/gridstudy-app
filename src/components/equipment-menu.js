/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';

import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import TableChartIcon from '@material-ui/icons/TableChart';

import { useIntl } from 'react-intl';
import { equipments } from './network/network-equipments';
import { useSelector } from 'react-redux';
import { PARAM_USE_NAME } from '../utils/config-params';

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

const EquipmentMenu = ({
    equipment,
    equipmentType,
    handleViewInSpreadsheet,
}) => {
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const intl = useIntl();

    return (
        <>
            {/* menu for equipment other than substation and voltage level */}
            {equipmentType !== equipments.substations &&
                equipmentType !== equipments.voltageLevels &&
                equipment && (
                    <ItemViewInSpreadsheet
                        equipmentType={equipmentType}
                        equipmentId={equipment.id}
                        itemText={intl.formatMessage({
                            id: 'ViewOnSpreadsheet',
                        })}
                        handleViewInSpreadsheet={handleViewInSpreadsheet}
                    />
                )}

            {/* menu for equipment substation or voltage level */}
            {equipmentType === equipments.substations && equipment && (
                // menu for the substation
                <ItemViewInSpreadsheet
                    equipmentType={equipmentType}
                    equipmentId={equipment.id}
                    itemText={
                        intl.formatMessage({ id: 'ViewOnSpreadsheet' }) +
                        ' (' +
                        useName
                            ? equipment.name
                            : equipment.id + ')'
                    }
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                />
            )}

            {equipmentType === equipments.substations &&
                equipment &&
                equipment.voltageLevels.map((v) => (
                    // menu for all voltage levels in the substation
                    <ItemViewInSpreadsheet
                        equipmentType={equipments.voltageLevels}
                        equipmentId={v.id}
                        itemText={
                            intl.formatMessage({ id: 'ViewOnSpreadsheet' }) +
                            ' (' +
                            useName
                                ? v.name
                                : v.id + ')'
                        }
                        handleViewInSpreadsheet={handleViewInSpreadsheet}
                    />
                ))}

            {equipmentType === equipments.voltageLevels && equipment && (
                <>
                    {/* menu for the substation */}
                    <ItemViewInSpreadsheet
                        equipmentType={equipments.substations}
                        equipmentId={equipment.substationId}
                        itemText={
                            intl.formatMessage({ id: 'ViewOnSpreadsheet' }) +
                            ' (' +
                            useName
                                ? equipment.substationName
                                : equipment.substationId + ')'
                        }
                        handleViewInSpreadsheet={handleViewInSpreadsheet}
                    />
                    {/* menu for the voltage level */}
                    <ItemViewInSpreadsheet
                        equipmentType={equipments.voltageLevels}
                        equipmentId={equipment.id}
                        itemText={
                            intl.formatMessage({ id: 'ViewOnSpreadsheet' }) +
                            ' (' +
                            useName
                                ? equipment.name
                                : equipment.id + ')'
                        }
                        handleViewInSpreadsheet={handleViewInSpreadsheet}
                    />
                </>
            )}
        </>
    );
};

export default EquipmentMenu;
