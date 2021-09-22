/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
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
    selectedNode,
}) => {
    const classes = useStyles();
    const intl = useIntl();

    function createNetworkModificationNode() {
        handleNodeCreation(selectedNode, 'NETWORK_MODIFICATION');
        handleClose();
    }

    function createModelNode() {
        handleNodeCreation(selectedNode, 'MODEL');
        handleClose();
    }

    function removeNode() {
        handleNodeRemoval(selectedNode);
        handleClose();
    }

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
            <MenuItem
                className={classes.menuItem}
                onClick={() => createNetworkModificationNode()}
            >
                <ListItemText
                    className={classes.listItemText}
                    primary={
                        <Typography noWrap>
                            {intl.formatMessage({
                                id: 'createNetworkModificationNode',
                            })}
                        </Typography>
                    }
                />
            </MenuItem>

            <MenuItem
                className={classes.menuItem}
                onClick={() => createModelNode()}
            >
                <ListItemText
                    className={classes.listItemText}
                    primary={
                        <Typography noWrap>
                            {intl.formatMessage({ id: 'createModelNode' })}
                        </Typography>
                    }
                />
            </MenuItem>

            <MenuItem className={classes.menuItem} onClick={() => removeNode()}>
                <ListItemText
                    className={classes.listItemText}
                    primary={
                        <Typography noWrap>
                            {intl.formatMessage({ id: 'removeNode' })}
                        </Typography>
                    }
                />
            </MenuItem>
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
