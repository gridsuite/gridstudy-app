/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import { equipments } from './network/network-equipments';

const useStyles = makeStyles((theme) => ({
    menu: {
        minWidth: 300,
        maxHeight: 800,
        overflowY: 'auto',
    },
}));

const withBatteryMenu = (BaseMenu) => ({
    id,
    position,
    handleClose,
    handleViewInSpreadsheet,
}) => {
    const classes = useStyles();

    return (
        <Menu
            className={classes.menu}
            anchorReference="anchorPosition"
            anchorPosition={{
                position: 'absolute',
                top: position[1],
                left: position[0],
            }}
            id="battery-menu"
            open={true}
            onClose={handleClose}
        >
            <BaseMenu
                equipmentId={id}
                equipmentType={equipments.batteries}
                handleViewInSpreadsheet={handleViewInSpreadsheet}
            />
        </Menu>
    );
};

export default withBatteryMenu;
