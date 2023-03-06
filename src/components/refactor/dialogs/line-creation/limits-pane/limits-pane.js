/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import {
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    LIMITS,
    PERMANENT_LIMIT,
} from 'components/refactor/utils/field-constants';
import FloatInput from '../../../rhf-inputs/float-input';
import {
    AmpereAdornment,
    gridItem,
    GridSection,
} from '../../../../dialogs/dialogUtils';
import React from 'react';

const LimitsPane = ({ id = LIMITS }) => {
    const permanentCurrentLimit1Field = (
        <FloatInput
            name={`${id}.${CURRENT_LIMITS_1}.${PERMANENT_LIMIT}`}
            label="PermanentCurrentLimitText"
            adornment={AmpereAdornment}
        />
    );

    const permanentCurrentLimit2Field = (
        <FloatInput
            name={`${id}.${CURRENT_LIMITS_2}.${PERMANENT_LIMIT}`}
            label="PermanentCurrentLimitText"
            adornment={AmpereAdornment}
        />
    );

    return (
        <>
            <GridSection title="Side1" />
            <Grid container spacing={2}>
                {gridItem(permanentCurrentLimit1Field, 4)}
            </Grid>
            <GridSection title="TemporaryCurrentLimitText" heading="4" />
            <GridSection title="Side2" />
            <Grid container spacing={2}>
                {gridItem(permanentCurrentLimit2Field, 4)}
            </Grid>
            <GridSection title="TemporaryCurrentLimitText" heading="4" />
        </>
    );
};

export default LimitsPane;
