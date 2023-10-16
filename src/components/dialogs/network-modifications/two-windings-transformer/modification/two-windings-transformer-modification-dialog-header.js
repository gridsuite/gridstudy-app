/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, TextField } from '@mui/material';
import {
    ENABLED,
    EQUIPMENT_NAME,
    RATIO_TAP_CHANGER,
    PHASE_TAP_CHANGER,
} from 'components/utils/field-constants';
import React from 'react';
import { filledTextField, gridItem } from '../../../dialogUtils';
import { TextInput } from '@gridsuite/commons-ui';
import { SwitchInput } from '@gridsuite/commons-ui';

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

    const ratioTapChangerEnabledField = (
        <SwitchInput
            name={`${RATIO_TAP_CHANGER}.${ENABLED}`}
            label="WithRatioTapChanger"
        />
    );

    const phaseTapChangerEnabledField = (
        <SwitchInput
            name={`${PHASE_TAP_CHANGER}.${ENABLED}`}
            label="WithPhaseTapChanger"
        />
    );

    return (
        <Grid container item spacing={2}>
            {gridItem(twoWindingsTransformerIdField, 4)}
            {gridItem(twoWindingsTransformerNameField, 4)}
            {gridItem(ratioTapChangerEnabledField, 2)}
            {gridItem(phaseTapChangerEnabledField, 2)}
        </Grid>
    );
};

export default TwoWindingsTransformerModificationDialogHeader;
