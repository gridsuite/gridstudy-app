/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import {
    ENABLED,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    PHASE_TAP_CHANGER,
    RATIO_TAP_CHANGER,
} from 'components/utils/field-constants';
import React from 'react';
import { filledTextField, GridItem } from '../../../dialog-utils';
import { TextInput } from '@gridsuite/commons-ui';
import { SwitchInput } from '@gridsuite/commons-ui';

const TwoWindingsTransformerCreationDialogHeader = () => {
    const twoWindingsTransformerIdField = <TextInput name={`${EQUIPMENT_ID}`} label="ID" formProps={filledTextField} />;

    const twoWindingsTransformerNameField = (
        <TextInput name={`${EQUIPMENT_NAME}`} label="Name" formProps={filledTextField} />
    );

    const ratioTapChangerEnabledField = (
        <SwitchInput name={`${RATIO_TAP_CHANGER}.${ENABLED}`} label="ConfigureRatioTapChanger" />
    );

    const phaseTapChangerEnabledField = (
        <SwitchInput name={`${PHASE_TAP_CHANGER}.${ENABLED}`} label="ConfigurePhaseTapChanger" />
    );

    return (
        <Grid container item spacing={2}>
            {GridItem(twoWindingsTransformerIdField, 4)}
            {GridItem(twoWindingsTransformerNameField, 4)}
            {GridItem(ratioTapChangerEnabledField, 2)}
            {GridItem(phaseTapChangerEnabledField, 2)}
        </Grid>
    );
};

export default TwoWindingsTransformerCreationDialogHeader;
