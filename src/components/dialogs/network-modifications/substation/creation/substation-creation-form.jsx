/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { filledTextField, gridItem } from '../../../dialogUtils';
import React from 'react';
import { TextInput } from '@gridsuite/commons-ui';
import {
    COUNTRY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
} from 'components/utils/field-constants';
import CountrySelectionInput from 'components/utils/rhf-inputs/country-selection-input';
import PropertiesForm from '../../common/properties/properties-form';

const SubstationCreationForm = () => {
    const substationIdField = (
        <TextInput
            name={EQUIPMENT_ID}
            label={'ID'}
            formProps={filledTextField}
        />
    );

    const substationNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
        />
    );

    const substationCountryField = (
        <CountrySelectionInput
            name={COUNTRY}
            label={'Country'}
            formProps={filledTextField}
            size={'small'}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(substationIdField, 4)}
                {gridItem(substationNameField, 4)}
                {gridItem(substationCountryField, 4)}
            </Grid>
            <PropertiesForm networkElementType={'substation'} />
        </>
    );
};

export default SubstationCreationForm;
