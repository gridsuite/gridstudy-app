/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Menu from '@mui/material/Menu';

const useStyles = makeStyles((theme) => ({
    menu: {
        minWidth: 300,
        maxHeight: 800,
        overflowY: 'visible',
    },
}));

const withEquipmentMenu =
    (BaseMenu, menuId, equipmentType) =>
    ({
        id,
        position,
        handleClose,
        handleViewInSpreadsheet,
        handleDeleteEquipment,
        handleOpenModificationDialog,
    }) => {
        const classes = useStyles();

        return (
            <Menu
                className={classes.menu}
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
                    equipmentId={id}
                    equipmentType={equipmentType}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                    handleDeleteEquipment={handleDeleteEquipment}
                    handleOpenModificationDialog={handleOpenModificationDialog}
                />
            </Menu>
        );
    };

export default withEquipmentMenu;
