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
import { COUNTRY, EQUIPMENT_NAME } from 'components/utils/field-constants';
import CountrySelectionInput from 'components/utils/rhf-inputs/country-selection-input';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { TextField } from '@mui/material';
import PropertiesForm from '../../common/properties/properties-form';

const SubstationModificationForm = ({ substationToModify, equipmentId }) => {
    const { translate } = useLocalizedCountries();

    const substationIdField = (
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

    const substationNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={substationToModify?.name}
            clearable
        />
    );

    const substationCountryField = (
        <CountrySelectionInput
            name={COUNTRY}
            label={'Country'}
            formProps={filledTextField}
            size={'small'}
            previousValue={translate(substationToModify?.countryCode)}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(substationIdField, 4)}
                {gridItem(substationNameField, 4)}
                {gridItem(substationCountryField, 4)}
            </Grid>
            <PropertiesForm
                networkElementType={'substation'}
                isModification={true}
            />
        </>
    );
};

export default SubstationModificationForm;
