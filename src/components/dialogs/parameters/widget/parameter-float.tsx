/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FloatInput } from '@gridsuite/commons-ui';

export interface ParameterFloatProps {
    name: string;
    label: string;
    style: any;
    adornment: any;
    labelSize: number;
    inputSize: number;
}

export const ParameterFloat = ({
    name,
    label,
    style,
    adornment,
    labelSize,
    inputSize,
}: ParameterFloatProps) => {
    return (
        <>
            <Grid item container direction={'row'} spacing={1} paddingTop={3}>
                <Grid item xs={labelSize} sx={style}>
                    <FormattedMessage id={label} />
                </Grid>
                <Grid item xs={inputSize}>
                    <FloatInput name={name} adornment={adornment} />
                </Grid>
            </Grid>
        </>
    );
};
