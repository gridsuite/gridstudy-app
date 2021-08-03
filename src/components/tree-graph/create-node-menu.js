/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { useIntl } from 'react-intl';
import PropTypes from "prop-types";

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

const CreateNodeMenu = ({position, handleClose, graph, item, handleCreateNode, handleRemoveNode}) => {
    const classes = useStyles();
    const intl = useIntl();

    function createHypoNode(graph, item) {
        handleClose();
        handleCreateNode(graph, item, 'hypoNode');
    }

    function createModelNode(graph, item) {
        handleClose();
        handleCreateNode(graph, item, 'modelNode');
    }

    function removeNode(graph, item) {
        handleClose();
        handleRemoveNode(graph, item);
    }

    return (
        <Menu
            anchorReference="anchorPosition"
            anchorPosition={{
                position: 'absolute',
                left: position[0],
                top: position[1],
            }}
            id="create-node-menu"
            open={true}
            onClose={handleClose}
        >
            <MenuItem
                className={classes.menuItem}
                onClick={() => createHypoNode(graph, item)}
            >
                <ListItemText
                    className={classes.listItemText}
                    primary={
                        <Typography noWrap>
                            {intl.formatMessage({ id: 'CreateHypoNode' })}
                        </Typography>
                    }
                />
            </MenuItem>

            <MenuItem
                className={classes.menuItem}
                onClick={() => createModelNode(graph, item)}
            >
                <ListItemText
                    className={classes.listItemText}
                    primary={
                        <Typography noWrap>
                            {intl.formatMessage({ id: 'CreateModelNode' })}
                        </Typography>
                    }
                />
            </MenuItem>

            <MenuItem
                className={classes.menuItem}
                onClick={() => removeNode(graph, item)}
            >
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
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    handleClose: PropTypes.func.isRequired,
    handleCreateNode: PropTypes.func.isRequired,
    handleRemoveNode: PropTypes.func.isRequired,
};

export default CreateNodeMenu;
