/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid, Tooltip } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FloatInput } from '@gridsuite/commons-ui';

export interface ParameterFloatProps {
    name: string;
    label: string;
    style: any;
    adornment: any;
    tooltip?: string;
}

export const ParameterFloat = ({
    name,
    label,
    style,
    adornment,
    tooltip,
}: ParameterFloatProps) => {
    return (
        <>
            <Tooltip title={tooltip ? <FormattedMessage id={tooltip} /> : ''}>
                <Grid
                    item
                    container
                    direction={'row'}
                    spacing={1}
                    paddingTop={3}
                >
                    <Grid item xs={9} sx={style}>
                        <FormattedMessage id={label} />
                    </Grid>

                    <Grid item xs={3}>
                        <FloatInput name={name} adornment={adornment} />
                    </Grid>
                </Grid>
            </Tooltip>
        </>
    );
};
