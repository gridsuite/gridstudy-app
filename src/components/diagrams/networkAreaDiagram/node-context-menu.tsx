/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Menu, Typography, ListItemIcon, ListItemText } from '@mui/material';
import { CustomMenuItem } from '@gridsuite/commons-ui';
import AddIcon from '@mui/icons-material/ControlPoint';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useIntl } from 'react-intl';

interface MenuAnchorPosition {
    mouseX: number;
    mouseY: number;
}

interface ContextMenuProps {
    open: boolean;
    anchorPosition: MenuAnchorPosition | null;
    onClose: () => void;
    onExpandItem: (id: string) => void;
    onHideItem: (id: string) => void;
    selectedItemId: string | undefined;
}

const NodeContextMenu: React.FC<ContextMenuProps> = ({
    open,
    anchorPosition,
    onClose,
    onExpandItem,
    onHideItem,
    selectedItemId,
}) => {
    const intl = useIntl();

    const handleExpandClick = () => {
        if (selectedItemId) {
            onExpandItem(selectedItemId);
        }
        onClose();
    };

    const handleHideClick = () => {
        if (selectedItemId) {
            onHideItem(selectedItemId);
        }
        onClose();
    };

    return (
        <Menu
            open={open}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={
                anchorPosition !== null ? { top: anchorPosition.mouseY, left: anchorPosition.mouseX } : undefined
            }
            style={{
                width: 'auto',
                maxHeight: 'auto',
            }}
        >
            <CustomMenuItem
                style={{
                    paddingTop: '1px',
                    paddingBottom: '1px',
                }}
                onClick={handleExpandClick}
            >
                <ListItemIcon>
                    <AddIcon />
                </ListItemIcon>
                <ListItemText primary={<Typography noWrap>{intl.formatMessage({ id: 'expand' })}</Typography>} />
            </CustomMenuItem>
            <CustomMenuItem
                style={{
                    paddingTop: '1px',
                    paddingBottom: '1px',
                }}
                onClick={handleHideClick}
            >
                <ListItemIcon>
                    <VisibilityOffIcon />
                </ListItemIcon>
                <ListItemText primary={<Typography noWrap>{intl.formatMessage({ id: 'hide' })}</Typography>} />
            </CustomMenuItem>
        </Menu>
    );
};

export default NodeContextMenu;
