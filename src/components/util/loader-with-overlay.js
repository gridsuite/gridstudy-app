/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { CircularProgress } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles((theme) => ({
    overlay: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'grey',
        opacity: '0.8',
        zIndex: 99,
        fontSize: 15,
    },
}));

const LoaderWithOverlay = ({
    color,
    loaderSize,
    loadingMessageText,
    isFixed,
}) => {
    const classes = useStyles();

    return (
        <div
            className={classes.overlay}
            style={{ position: isFixed ? 'fixed' : 'absolute' }}
        >
            <CircularProgress color={color} size={loaderSize} />
            <FormattedMessage id={loadingMessageText} />
        </div>
    );
};

export default LoaderWithOverlay;
