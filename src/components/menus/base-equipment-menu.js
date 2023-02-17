/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import MenuItem from '@mui/material/MenuItem';

import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import TableChartIcon from '@mui/icons-material/TableChart';
import { NestedMenuItem } from 'mui-nested-menu';

import { useIntl } from 'react-intl';
import { equipments } from '../network/network-equipments';
import { useSelector } from 'react-redux';
import { useNameOrId } from '../util/equipmentInfosHandler';
import EditIcon from '@mui/icons-material/Edit';
import GeneratorModificationDialog from '../dialogs/generator-modification-dialog';
import { withVLsIdsAndTopology } from 'components/graph/menus/network-modification-node-editor';
import { useParams } from 'react-router-dom';

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

const BaseEquipmentMenu = ({
    equipmentId,
    equipmentType,
    handleViewInSpreadsheet,
}) => {
    const intl = useIntl();
    const classes = useStyles();
    const network = useSelector((state) => state.network);
    const [openDialog, setOpenDialog] = useState(false);
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const currentTreeNode = useSelector((state) => state.currentTreeNode);

    function getEquipment(equipmentType, equipmentId) {
        if (equipmentType === equipments.substations) {
            return network.getSubstation(equipmentId);
        } else if (equipmentType === equipments.voltageLevels) {
            return network.getVoltageLevel(equipmentId);
        } else {
            return null;
        }
    }

    const handleEditGenerator = () => {
        setOpenDialog(true);
    };

    const equipment = getEquipment(equipmentType, equipmentId);
    const { getNameOrId } = useNameOrId();
    return (
        <>
            {/* menus for equipment other than substation and voltage level */}
            {equipmentType !== equipments.substations &&
                equipmentType !== equipments.voltageLevels && (
                    <>
                        <ItemViewInSpreadsheet
                            key="ViewOnSpreadsheet"
                            equipmentType={equipmentType}
                            equipmentId={equipmentId}
                            itemText={intl.formatMessage({
                                id: 'ViewOnSpreadsheet',
                            })}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />
                        {equipmentType === equipments.generators && (
                            <MenuItem
                                className={classes.menuItem}
                                onClick={() => handleEditGenerator()}
                            >
                                <ListItemIcon>
                                    <EditIcon></EditIcon>
                                </ListItemIcon>
                                <ListItemText
                                    className={classes.listItemText}
                                    primary={
                                        <Typography noWrap>
                                            {intl.formatMessage({
                                                id: 'edit',
                                            })}
                                        </Typography>
                                    }
                                ></ListItemText>
                            </MenuItem>
                        )}
                    </>
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
            {openDialog && (
                <GeneratorModificationDialog
                    open={openDialog}
                    studyUuid={studyUuid}
                    currentNodeUuid={currentTreeNode?.id}
                    onClose={() => setOpenDialog(false)}
                    editData={equipmentId}
                    voltageLevelsIdsAndTopologyPromise={withVLsIdsAndTopology(
                        studyUuid,
                        currentTreeNode?.id
                    )}
                    // equipmentOptionsPromise={withEqptModificationOptions(
                    //     studyUuid,
                    //     currentTreeNode?.id,
                    //     'Generators',
                    //     'generators'
                    // )}
                    // voltageLevelOptionsPromise={withVoltageLevels(
                    //     studyUuid,
                    //     currentTreeNode?.id
                    // )}
                    // voltageLevelsEquipmentsOptionsPromise={withVoltageLevelsAndEquipments(
                    //     studyUuid,
                    //     currentTreeNode?.id
                    // )}
                ></GeneratorModificationDialog>
            )}
        </>
    );
};

export default BaseEquipmentMenu;
