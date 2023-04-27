/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { filledTextField, gridItem, GridSection } from '../../dialogUtils';
import { getObjectId } from 'components/utils/utils';
import React, { useCallback, useEffect, useState } from 'react';
import TextInput from '../../../utils/rhf-inputs/text-input';
import {
    ADDITIONAL_PROPERTIES,
    COUNTRY,
    DELETION_MARK,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    PREVIOUS_VALUE,
} from '../../../utils/field-constants';
import CountrySelectionInput from '../../../utils/rhf-inputs/country-selection-input';
import ExpandableInput from '../../../utils/rhf-inputs/expandable-input';
import PropertyForm from '../property/property-form';
import { getPropertyInitialValues } from '../property/property-utils';
import { fetchEquipmentsIds } from '../../../../utils/rest-api';
import { useFormContext, useWatch } from 'react-hook-form';
import AutocompleteInput from '../../../utils/rhf-inputs/autocomplete-input';
import { LocalizedCountries } from '../../../utils/localized-countries-hook';

const SubstationModificationForm = ({
    currentNode,
    studyUuid,
    substationToModify,
    onEquipmentIdChange,
}) => {
    const currentNodeUuid = currentNode?.id;
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const equipmentId = useWatch({
        name: EQUIPMENT_ID,
    });
    const watchProps = useWatch({
        name: ADDITIONAL_PROPERTIES,
    });
    const { getValues, setValue } = useFormContext();
    const { translate } = LocalizedCountries();

    const getDeletionMark = useCallback(
        (idx) => {
            const properties = getValues(`${ADDITIONAL_PROPERTIES}`);
            if (properties && typeof properties[idx] !== 'undefined') {
                return watchProps && properties[idx][DELETION_MARK];
            }
            return false;
        },
        [getValues, watchProps]
    );

    const deleteCallback = useCallback(
        (idx) => {
            let marked = false;
            const properties = getValues(`${ADDITIONAL_PROPERTIES}`);
            if (properties && typeof properties[idx] !== 'undefined') {
                marked = properties[idx][DELETION_MARK];
            } else {
                return false;
            }

            let canRemoveLine = true;
            if (marked) {
                // just unmark
                setValue(
                    `${ADDITIONAL_PROPERTIES}.${idx}.${DELETION_MARK}`,
                    false
                );
                canRemoveLine = false;
            } else {
                // we can mark as deleted only real prop (having a previous value)
                if (properties[idx][PREVIOUS_VALUE]) {
                    setValue(
                        `${ADDITIONAL_PROPERTIES}.${idx}.${DELETION_MARK}`,
                        true
                    );
                    canRemoveLine = false;
                }
            }
            // otherwise just delete the line
            return canRemoveLine;
        },
        [getValues, setValue]
    );

    useEffect(() => {
        fetchEquipmentsIds(
            studyUuid,
            currentNodeUuid,
            undefined,
            'SUBSTATION',
            true
        ).then((values) => {
            setEquipmentOptions(values.sort((a, b) => a.localeCompare(b)));
        });
    }, [studyUuid, currentNodeUuid]);

    useEffect(() => {
        onEquipmentIdChange(equipmentId);
    }, [equipmentId, onEquipmentIdChange]);

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

    const additionalProps = (
        <ExpandableInput
            name={ADDITIONAL_PROPERTIES}
            Field={PropertyForm}
            addButtonLabel={'AddProperty'}
            initialValue={getPropertyInitialValues()}
            getDeletionMark={getDeletionMark}
            deleteCallback={deleteCallback}
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
