/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Typography } from '@mui/material';
import EquipmentFilter from './equipment-filter';
import ModelFilter from './model-filter';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { useTheme } from '@mui/styles';

const CurveSelector = (props) => {
    const theme = useTheme();
    return (
        <>
            <Grid
                item
                container
                xs={6}
                direction={'column'}
                alignItems={'flex-start'}
                justifyContent={'flex-start'}
                spacing={1}
            >
                <Typography
                    sx={{ marginBottom: theme.spacing(2) }}
                    variant="h6"
                >
                    <FormattedMessage
                        id={'DynamicSimulationCurveEquipmentFilter'}
                    ></FormattedMessage>
                </Typography>
                <EquipmentFilter />
            </Grid>
            <Grid
                item
                container
                xs={6}
                direction={'column'}
                alignItems={'flex-start'}
                justifyContent={'flex-start'}
                spacing={1}
            >
                <Typography
                    sx={{ marginBottom: theme.spacing(2) }}
                    variant="h6"
                >
                    <FormattedMessage
                        id={'DynamicSimulationCurveCurveFilter'}
                    ></FormattedMessage>
                </Typography>
                <ModelFilter />
            </Grid>
        </>
    );
};

export default CurveSelector;
