import { TextInput } from '@gridsuite/commons-ui';
import { filledTextField, gridItem } from '../../../dialogUtils';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
} from '../../../../utils/field-constants';
import Grid from '@mui/material/Grid';
import VscTabs from '../vsc-tabs';
import React from 'react';
import { Box } from "@mui/system";

/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

function VscCreationForm() {
    const generatorIdField = (
        <TextInput
            name={EQUIPMENT_ID}
            label={'ID'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const generatorNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
        />
    );

    return (
        <>

        </>
    );
}
