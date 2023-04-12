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
import React, { useCallback, useEffect, useState } from 'react';
import TextInput from '../../rhf-inputs/text-input';
import {
    ADDITIONAL_PROPERTIES,
    COUNTRY,
    DELETION_MARK,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    NAME,
    PREVIOUS_VALUE,
    VALUE,
} from '../../utils/field-constants';
import CountrySelectionInput from '../../rhf-inputs/country-selection-input';
import ExpandableInput from '../../rhf-inputs/expandable-input';
import PropertyForm from '../substation-creation/property/property-form';
import { getPropertyInitialValues } from '../substation-creation/property/property-utils';
import {
    fetchEquipmentInfos,
    fetchEquipmentsIds,
} from '../../../../utils/rest-api';
import { useFormContext, useWatch } from 'react-hook-form';
import AutocompleteInput from '../../rhf-inputs/autocomplete-input';

const SubstationModificationForm = ({ currentNode, studyUuid }) => {
    const currentNodeUuid = currentNode?.id;
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const [equipmentInfos, setEquipmentInfos] = useState(null);
    const equipmentId = useWatch({
        name: `${EQUIPMENT_ID}`,
    });
    const { getValues, setValue } = useFormContext();

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
            /*
                1- update modifications with previous value / real equipment value
                2- add any property defined for this equipment, but not in modifications
                3- remove all infos from 1/2 below if no more equipment (equipmentInfos is null)
             */

            // comes from existing eqpt in network, ex: Object { p1: "v1", p2: "v2" }
            const equipmentProperties = equipmentInfos?.properties;
            // comes from modification in db, ex: Array [ {Object {  name: "p1", value: "v1", previousValue: undefined } }, {...} ]
            const modificationProperties = getValues(
                `${ADDITIONAL_PROPERTIES}`
            );
            console.log(
                'DBR updateWithEquipmentInfos',
                equipmentProperties,
                modificationProperties
            );

            let newModificationProperties = [];
            // update array field with previous value / real equipment value
            modificationProperties.forEach(function (property, idx) {
                newModificationProperties.push({
                    ...property,
                    [PREVIOUS_VALUE]:
                        equipmentProperties &&
                        property[NAME] in equipmentProperties
                            ? equipmentProperties[property[NAME]]
                            : null,
                });
            });

            console.log(
                'DBR newModificationProperties1',
                newModificationProperties
            );

            if (equipmentProperties) {
                // add any property defined for this equipment, but missing in modifications
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
                console.log(
                    'DBR newModificationProperties2',
                    newModificationProperties
                );
            }
            setValue(`${ADDITIONAL_PROPERTIES}`, newModificationProperties);
        },
        [getValues, setValue]
    );

    const deleteIconDisableCallback = useCallback(
        (idx) => {
            const props = getValues(`${ADDITIONAL_PROPERTIES}`);
            if (props && typeof props[idx] !== 'undefined') {
                return props[idx][DELETION_MARK];
            }
            return false;
        },
        [getValues]
    );

    const deleteCallback = useCallback(
        (idx) => {
            console.log('deleteCallback', idx);
            const props = getValues(`${ADDITIONAL_PROPERTIES}`);
            let removeLine = true;
            if (props && typeof props[idx] !== 'undefined') {
                const modificationProperties = getValues(
                    `${ADDITIONAL_PROPERTIES}`
                );
                let newModificationProperties = [];
                modificationProperties.forEach(function (property, forEachIdx) {
                    console.log(
                        'deleteCallback property',
                        forEachIdx,
                        property
                    );
                    if (
                        forEachIdx !== idx ||
                        property[PREVIOUS_VALUE] === null
                    ) {
                        newModificationProperties.push({ ...property });
                        console.log('deleteCallback removeLine', forEachIdx);
                    } else {
                        // line is not deleted, but just marked
                        newModificationProperties.push({
                            ...property,
                            [DELETION_MARK]: true,
                        });
                        removeLine = false;
                        console.log(
                            'deleteCallback dont removeLine',
                            forEachIdx
                        );
                    }
                });
                setValue(`${ADDITIONAL_PROPERTIES}`, newModificationProperties);
            }
            console.log('deleteCallback return', removeLine);
            return removeLine;
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
            )
                .then((value) => {
                    console.log('DBR useEff setEquipmentInfos', value);
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
            previousValue={equipmentInfos?.countryName}
        />
    );

    const additionalProps = (
        <ExpandableInput
            name={ADDITIONAL_PROPERTIES}
            Field={PropertyForm}
            addButtonLabel={'AddProperty'}
            initialValue={getPropertyInitialValues()}
            deleteIconDisableCallback={deleteIconDisableCallback}
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
