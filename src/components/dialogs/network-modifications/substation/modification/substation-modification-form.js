/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { filledTextField, gridItem, GridSection } from '../../../dialogUtils';
import React, { useCallback } from 'react';
import TextInput from 'components/utils/rhf-inputs/text-input';
import {
    ADDITIONAL_PROPERTIES,
    COUNTRY,
    DELETION_MARK,
    EQUIPMENT_NAME,
    PREVIOUS_VALUE,
    ADDED,
} from 'components/utils/field-constants';
import CountrySelectionInput from 'components/utils/rhf-inputs/country-selection-input';
import ExpandableInput from 'components/utils/rhf-inputs/expandable-input';
import PropertyForm from '../property/property-form';
import { getPropertyInitialValues } from '../property/property-utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { LocalizedCountries } from 'components/utils/localized-countries-hook';
import { TextField } from '@mui/material';

const SubstationModificationForm = ({ substationToModify, equipmentId }) => {
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
                    false,
                    { shouldDirty: true }
                );
                canRemoveLine = false;
            } else {
                // we can mark as deleted only prop having a previous value, not added in current modification
                if (
                    properties[idx][PREVIOUS_VALUE] &&
                    properties[idx][ADDED] === false
                ) {
                    setValue(
                        `${ADDITIONAL_PROPERTIES}.${idx}.${DELETION_MARK}`,
                        true,
                        { shouldDirty: true }
                    );
                    canRemoveLine = false;
                }
            }
            // otherwise just delete the line
            return canRemoveLine;
        },
        [getValues, setValue]
    );

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

    const additionalProps = (
        <ExpandableInput
            name={ADDITIONAL_PROPERTIES}
            Field={PropertyForm}
            addButtonLabel={'AddProperty'}
            initialValue={getPropertyInitialValues()}
            getDeletionMark={getDeletionMark}
            deleteCallback={deleteCallback}
            watchProps={watchProps}
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
