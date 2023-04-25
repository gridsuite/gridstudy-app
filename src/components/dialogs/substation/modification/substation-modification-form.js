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
    NAME,
    PREVIOUS_VALUE,
    VALUE,
} from '../../../utils/field-constants';
import CountrySelectionInput from '../../../utils/rhf-inputs/country-selection-input';
import ExpandableInput from '../../../utils/rhf-inputs/expandable-input';
import PropertyForm from '../property/property-form';
import { getPropertyInitialValues } from '../property/property-utils';
import {
    fetchEquipmentInfos,
    fetchEquipmentsIds,
} from '../../../../utils/rest-api';
import { useFormContext, useWatch } from 'react-hook-form';
import AutocompleteInput from '../../../utils/rhf-inputs/autocomplete-input';
import { LocalizedCountries } from '../../../utils/localized-countries';

const SubstationModificationForm = ({ currentNode, studyUuid }) => {
    const currentNodeUuid = currentNode?.id;
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const [equipmentInfos, setEquipmentInfos] = useState(null);
    const equipmentId = useWatch({
        name: `${EQUIPMENT_ID}`,
    });
    const { getValues, setValue } = useFormContext();
    const { translate } = LocalizedCountries();

    const createPropertyValuesFromExistingEquipement = (propKey, propValue) => {
        return {
            [NAME]: propKey,
            [VALUE]: null,
            [PREVIOUS_VALUE]: propValue,
            [DELETION_MARK]: false,
        };
    };

    const updateWithEquipmentInfos = useCallback(
        (equipmentInfos) => {
            setEquipmentInfos(equipmentInfos);
            // comes from existing eqpt in network, ex: Object { p1: "v1", p2: "v2" }
            const equipmentProperties = equipmentInfos?.properties;
            // comes from modification in db,
            // ex: Array [ {Object {  name: "p1", value: "v2", previousValue: undefined, deletionMark: false } }, {...} ]
            const modificationProperties = getValues(
                `${ADDITIONAL_PROPERTIES}`
            );

            let newModificationProperties = [];
            // update array field with previous value / real equipment value
            modificationProperties.forEach(function (property) {
                newModificationProperties.push({
                    ...property,
                    [PREVIOUS_VALUE]:
                        equipmentProperties &&
                        property[NAME] in equipmentProperties
                            ? equipmentProperties[property[NAME]]
                            : null,
                });
            });
            if (equipmentProperties) {
                // add any property defined for this equipment, but missing in modification
                const modificationPropertiesNames = modificationProperties.map(
                    (obj) => obj[NAME]
                );
                for (const [propKey, propValue] of Object.entries(
                    equipmentProperties
                )) {
                    if (!modificationPropertiesNames.includes(propKey)) {
                        newModificationProperties.push(
                            createPropertyValuesFromExistingEquipement(
                                propKey,
                                propValue
                            )
                        );
                    }
                }
            }
            setValue(`${ADDITIONAL_PROPERTIES}`, newModificationProperties);
        },
        [getValues, setValue]
    );

    const getDeletionMark = useCallback(
        (idx) => {
            const properties = getValues(`${ADDITIONAL_PROPERTIES}`);
            if (properties && typeof properties[idx] !== 'undefined') {
                return properties[idx][DELETION_MARK];
            }
            return false;
        },
        [getValues]
    );

    const deleteCallback = useCallback(
        (idx) => {
            let canRemoveLine = true;
            let newModificationProperties = [];

            const properties = getValues(`${ADDITIONAL_PROPERTIES}`);
            properties.forEach(function (property, forEachIdx) {
                if (forEachIdx !== idx || property[PREVIOUS_VALUE] === null) {
                    newModificationProperties.push({ ...property });
                } else {
                    // line is not deleted, and property is marked or unmarked for deletion
                    let currentDeletionMark = property[DELETION_MARK];
                    newModificationProperties.push({
                        ...property,
                        [DELETION_MARK]: !currentDeletionMark,
                    });
                    canRemoveLine = false;
                }
            });
            if (canRemoveLine === false) {
                setValue(`${ADDITIONAL_PROPERTIES}`, newModificationProperties);
            }
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
        if (equipmentId) {
            fetchEquipmentInfos(
                studyUuid,
                currentNodeUuid,
                'substations',
                equipmentId,
                true
            )
                .then((value) => {
                    updateWithEquipmentInfos(value);
                })
                .catch(() => {
                    updateWithEquipmentInfos(null);
                });
        } else {
            updateWithEquipmentInfos(null);
        }
    }, [studyUuid, currentNodeUuid, equipmentId, updateWithEquipmentInfos]);

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
            previousValue={translate(equipmentInfos?.countryCode)}
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
