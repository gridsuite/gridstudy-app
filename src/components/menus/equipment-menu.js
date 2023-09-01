/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import Menu from '@mui/material/Menu';

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
    }) => {
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
            </Menu>
        );
    };

export default withEquipmentMenu;
