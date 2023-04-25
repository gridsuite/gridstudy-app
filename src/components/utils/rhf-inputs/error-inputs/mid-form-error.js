/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    midFormErrorMessage: {
        color: theme.palette.error.main,
        fontSize: 'small',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
    },
}));

// component to display error message in the middle of dialogue
const MidFormError = ({ message }) => {
    const classes = useStyles();
    return <div className={classes.midFormErrorMessage}>{message}</div>;
};

export default MidFormError;
