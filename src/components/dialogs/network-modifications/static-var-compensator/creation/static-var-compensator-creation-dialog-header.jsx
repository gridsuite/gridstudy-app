/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { EQUIPMENT_ID, EQUIPMENT_NAME } from 'components/utils/field-constants';
import React from 'react';
import { filledTextField, gridItem } from '../../../dialogUtils';
import { TextInput } from '@gridsuite/commons-ui';

const StaticVarCompensatorCreationDialogHeader = () => {
    const staticCompensatorIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, ...filledTextField }} />
    );

    const staticCompensatorNameField = <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={filledTextField} />;
    return (
        <Grid container item spacing={2}>
            {gridItem(staticCompensatorIdField, 4)}
            {gridItem(staticCompensatorNameField, 4)}
        </Grid>
    );
};

export default StaticVarCompensatorCreationDialogHeader;
