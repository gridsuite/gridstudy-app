/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, TextField } from '@mui/material';
import { EQUIPMENT_NAME } from 'components/utils/field-constants';
import React from 'react';
import { filledTextField, gridItem } from '../../../dialogUtils';
import TextInput from 'components/utils/rhf-inputs/text-input';

const TwoWindingsTransformerModificationDialogHeader = ({
    equipmentToModify,
    equipmentId,
}) => {
    const twoWindingsTransformerIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={equipmentId}
            InputProps={{
                readOnly: true,
            }}
            disabled
            {...filledTextField}
        />
    );

    const twoWindingsTransformerNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label="Name"
            formProps={filledTextField}
            previousValue={equipmentToModify?.name}
            clearable
        />
    );

    return (
        <Grid container item spacing={2}>
            {gridItem(twoWindingsTransformerIdField)}
            {gridItem(twoWindingsTransformerNameField)}
        </Grid>
    );
};

export default TwoWindingsTransformerModificationDialogHeader;
