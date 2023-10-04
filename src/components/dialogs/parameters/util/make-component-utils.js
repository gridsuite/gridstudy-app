/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, InputAdornment } from '@mui/material';
import { styles } from '../parameters';
import { LineSeparator } from '../../dialogUtils';
import React from 'react';
import { FormattedMessage } from 'react-intl';

export const makeComponents = (defParams) => {
    return Object.keys(defParams).map((key) => (
        <Grid container spacing={1} paddingTop={1} key={key}>
            {makeComponent(defParams[key], key)}
            <LineSeparator />
        </Grid>
    ));
};

export const makeComponent = (defParam, key) => {
    const render = defParam.render;

    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={defParam.label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                {render(defParam, key)}
            </Grid>
        </>
    );
};

export const getValue = (param, key) => {
    if (!param || param[key] === undefined) {
        return null;
    }
    return param[key];
};

export const inputAdornment = (content) => ({
    endAdornment: <InputAdornment position="end">{content}</InputAdornment>,
});
