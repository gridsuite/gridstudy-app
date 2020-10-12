/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PowerIcon from '@material-ui/icons/Power';
import PowerOffIcon from '@material-ui/icons/PowerOff';

import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles((theme) => ({
    menu: {
        backgroundColor: theme.palette.background.paper,
        maxHeight: 800,
    },
    button: {
        color: 'black',
    },
    listIItemText: {
        fontSize: 12,
        padding: '8px',
    },
}));

const SingleLineDiagramActions = ({ handleSldLockout, lockout, message }) => {
    const classes = useStyles();

    return (
        <Box display={'flex'} flexDirection={'column'} className={classes.menu}>
            <Tooltip title={message} placement={'right'}>
                <IconButton
                    className={classes.button}
                    onClick={handleSldLockout}
                >
                    {lockout && <PowerOffIcon fontSize={'large'} />}

                    {!lockout && <PowerIcon fontSize={'large'} />}
                </IconButton>
            </Tooltip>
        </Box>
    );
};

export default SingleLineDiagramActions;
