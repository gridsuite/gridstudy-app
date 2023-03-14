import Grid from '@mui/material/Grid';
import {
    filledTextField,
    gridItem,
    GridSection,
} from '../../../dialogs/dialogUtils';
import React from 'react';
import TextInput from '../../rhf-inputs/text-input';
import {
    ADDITIONAL_PROPERTIES,
    COUNTRY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    ID,
} from '../../utils/field-constants';
import CountrySelectionInput from '../../rhf-inputs/country-selection-input';
import ExpandableInput from '../../rhf-inputs/expandable-input';
import PropertyForm from './property/property-form';

const SubstationCreationForm = ({}) => {
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

    const AdditionalProps = (
        <ExpandableInput
            name={ADDITIONAL_PROPERTIES}
            Field={PropertyForm}
            addButtonLabel={'AddProperty'}
        />
    );
    return (
        <>
            <Grid container spacing={2}>
                {gridItem(substationIdField, 4)}
                {gridItem(substationNameField, 4)}
                {gridItem(substationCountryField, 4)}
            </Grid>

            <Grid container>
                <GridSection title={'AdditionalInformations'} />
                {AdditionalProps}
            </Grid>
        </>
    );
};

export default SubstationCreationForm;
