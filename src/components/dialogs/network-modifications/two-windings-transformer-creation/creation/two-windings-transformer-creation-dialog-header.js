/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import {
    CHARACTERISTICS,
    ENABLED,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    PHASE_TAP_CHANGER,
    RATIO_TAP_CHANGER
} from 'components/utils/field-constants';
import React from 'react';
import { filledTextField, gridItem } from '../../../dialogUtils';
import TextInput from 'components/utils/rhf-inputs/text-input';
import SwitchInput from '../../../../utils/rhf-inputs/booleans/switch-input';

const TwoWindingsTransformerCreationDialogHeader = () => {

    const twoWindingsTransformerIdField = (
        <TextInput
            name={`${CHARACTERISTICS}.${EQUIPMENT_ID}`}
            label="ID"
            formProps={filledTextField}
        />
    );

    const twoWindingsTransformerNameField = (
        <TextInput
            name={`${CHARACTERISTICS}.${EQUIPMENT_NAME}`}
            label="Name"
            formProps={filledTextField}
        />
    );

    const ratioTapChangerEnabledField = (
        <SwitchInput
            name={`${RATIO_TAP_CHANGER}.${ENABLED}`}
            label="ConfigureRatioTapChanger"
        />
    );

    const phaseTapChangerEnabledField = (
        <SwitchInput
            name={`${PHASE_TAP_CHANGER}.${ENABLED}`}
            label="ConfigurePhaseTapChanger"
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

export default TwoWindingsTransformerCreationDialogHeader;
