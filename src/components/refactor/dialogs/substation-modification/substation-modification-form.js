/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    filledTextField,
    gridItem,
    GridSection,
} from '../../../dialogs/dialogUtils';
import { getObjectId } from 'components/refactor/utils/utils';
import React, { useEffect, useState } from 'react';
import TextInput from '../../rhf-inputs/text-input';
import {
    ADDITIONAL_PROPERTIES,
    COUNTRY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
} from '../../utils/field-constants';
import CountrySelectionInput from '../../rhf-inputs/country-selection-input';
import ExpandableInput from '../../rhf-inputs/expandable-input';
import PropertyForm from '../substation-creation/property/property-form';
import { getPropertyInitialValues } from '../substation-creation/property/property-utils';
import {
    fetchEquipmentInfos,
    fetchEquipmentsIds,
} from '../../../../utils/rest-api';
import { useWatch } from 'react-hook-form';
import AutocompleteInput from '../../rhf-inputs/autocomplete-input';

const SubstationModificationForm = ({ currentNode, studyUuid }) => {
    const currentNodeUuid = currentNode?.id;
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const [equipmentInfos, setEquipmentInfos] = useState(null);

    const equipmentId = useWatch({
        name: `${EQUIPMENT_ID}`,
    });

    useEffect(() => {
        console.log('DBR useEff');
        fetchEquipmentsIds(
            studyUuid,
            currentNodeUuid,
            undefined,
            'SUBSTATION',
            true
        ).then((values) => {
            console.log('DBR useEff setEquipmentOptions', values);
            setEquipmentOptions(values.sort((a, b) => a.localeCompare(b)));
        });
    }, [studyUuid, currentNodeUuid]);

    useEffect(() => {
        if (equipmentId) {
            fetchEquipmentInfos(
                studyUuid,
                currentNodeUuid,
                'substations',
                equipmentId,
                true
            ).then((value) => {
                console.log('DBR useEff setEquipmentInfos', value);
                if (value) {
                    setEquipmentInfos(value);
                }
            });
        } else {
            setEquipmentInfos(null);
        }
    }, [studyUuid, currentNodeUuid, equipmentId]);

    const substationIdField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${EQUIPMENT_ID}`}
            label="ID"
            options={equipmentOptions}
            getOptionLabel={getObjectId}
            size={'small'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const substationNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={equipmentInfos?.name}
            clearable
        />
    );

    const substationCountryField = (
        <CountrySelectionInput
            name={COUNTRY}
            label={'Country'}
            formProps={filledTextField}
            size={'small'}
            previousValue={equipmentInfos?.countryName}
        />
    );

    const additionalProps = (
        <ExpandableInput
            name={ADDITIONAL_PROPERTIES}
            Field={PropertyForm}
            addButtonLabel={'AddProperty'}
            initialValue={getPropertyInitialValues()}
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
                {additionalProps}
            </Grid>
        </>
    );
};

export default SubstationModificationForm;
