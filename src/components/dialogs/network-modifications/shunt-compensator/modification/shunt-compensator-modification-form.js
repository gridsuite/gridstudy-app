import { CharacteristicsForm } from '../characteristics-pane/characteristics-form';
import React, { useEffect, useState } from 'react';
import TextInput from '../../../../utils/rhf-inputs/text-input';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
} from '../../../../utils/field-constants';
import { filledTextField, gridItem, GridSection } from '../../../dialogUtils';
import Grid from '@mui/material/Grid';
import AutocompleteInput from '../../../../utils/rhf-inputs/autocomplete-input';
import { areIdsEqual, getObjectId } from '../../../../utils/utils';
import { fetchEquipmentsIds } from '../../../../../utils/rest-api';

const ShuntCompensatorModificationForm = ({ studyUuid, currentNodeUuid }) => {
    const [shuntCompensatorOptions, setShuntCompensatorOptions] = useState([]);

    useEffect(() => {
        fetchEquipmentsIds(
            studyUuid,
            currentNodeUuid,
            undefined,
            'SHUNT_COMPENSATOR',
            true
        ).then((values) => {
            setShuntCompensatorOptions(
                values.sort((a, b) => a.localeCompare(b))
            );
        });
    });

    const shuntCompensatorIdField = (
        <AutocompleteInput
            isOptionEqualToValue={areIdsEqual}
            allowNewValue
            forcePopupIcon
            name={EQUIPMENT_ID}
            label={'ID'}
            options={shuntCompensatorOptions}
            getOptionLabel={getObjectId}
            outputTransform={getObjectId}
            size={'small'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const shuntCompensatorNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
        />
    );

    const characteristicsForm = <CharacteristicsForm />;

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(shuntCompensatorIdField, 4)}
                {gridItem(shuntCompensatorNameField, 4)}
            </Grid>
            <GridSection title="Connectivity" />
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                {gridItem(characteristicsForm, 12)}
            </Grid>
        </>
    );
};

export default ShuntCompensatorModificationForm;
