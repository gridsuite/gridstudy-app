/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

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

const CreateNodeMenu = ({
    position,
    handleClose,
    handleNodeCreation,
    handleNodeRemoval,
    handleExportCaseOnNode,
    activeNode,
}) => {
    const classes = useStyles();
    const intl = useIntl();

    function createNetworkModificationNode(insertMode) {
        handleNodeCreation(activeNode, 'NETWORK_MODIFICATION', insertMode);
        handleClose();
    }

    function removeNode() {
        handleNodeRemoval(activeNode);
        handleClose();
    }

    function exportCaseOnNode() {
        handleExportCaseOnNode(activeNode);
        handleClose();
    }

    const NODE_MENU_ITEMS = {
        CREATE_MODIFICATION_NODE: {
            onRoot: true,
            action: () => createNetworkModificationNode('CHILD'),
            id: 'createNetworkModificationNode',
        },
        INSERT_MODIFICATION_NODE_BEFORE: {
            onRoot: false,
            action: () => createNetworkModificationNode('BEFORE'),
            id: 'insertNetworkModificationNodeAbove',
        },
        INSERT_MODIFICATION_NODE_AFTER: {
            onRoot: true,
            action: () => createNetworkModificationNode('AFTER'),
            id: 'insertNetworkModificationNodeBelow',
        },
        REMOVE_NODE: {
            onRoot: false,
            action: () => removeNode(),
            id: 'removeNode',
        },
        EXPORT_NETWORK_ON_NODE: {
            onRoot: true,
            action: () => exportCaseOnNode(),
            id: 'exportCaseOnNode',
            disabled:
                activeNode?.type !== 'ROOT' &&
                activeNode?.data?.buildStatus !== 'BUILT',
        },
    };

    return (
        <Menu
            anchorReference="anchorPosition"
            anchorPosition={{
                position: 'absolute',
                left: position.x,
                top: position.y,
            }}
            id="create-node-menu"
            open={true}
            onClose={handleClose}
        >
            {Object.values(NODE_MENU_ITEMS).map((item) => {
                return (
                    (activeNode?.type !== 'ROOT' || item.onRoot) && (
                        <MenuItem
                            className={classes.menuItem}
                            onClick={item.action}
                            key={item.id}
                            disabled={item.disabled}
                        >
                            <ListItemText
                                key={item.id}
                                className={classes.listItemText}
                                primary={
                                    <Typography noWrap>
                                        {intl.formatMessage({
                                            id: item.id,
                                        })}
                                    </Typography>
                                }
                            />
                        </MenuItem>
                    )
                );
            })}
        </Menu>
    );
};

CreateNodeMenu.propTypes = {
    position: PropTypes.object.isRequired,
    handleNodeCreation: PropTypes.func.isRequired,
    handleNodeRemoval: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
};

export default CreateNodeMenu;
