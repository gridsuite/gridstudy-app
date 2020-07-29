/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';

import Container from '@material-ui/core/Container';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
    error: {
        fontSize: '64px',
        width: '20%',
        marginLeft: '40%',
    },
    container: {
        marginTop: '70px',
    },
}));

const PageNotFound = ({ message }) => {
    const classes = useStyles();
    return (
        <Container className={classes.container}>
            <br />
            <ErrorOutlineIcon className={classes.error} />
            <h1 style={{ textAlign: 'center' }}>{message}</h1>
        </Container>
    );
};

export default PageNotFound;
