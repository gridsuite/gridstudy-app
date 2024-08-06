/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { GridSection } from '../../../dialogUtils';
import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useState } from 'react';
import ExpandableInput from '../../../../utils/rhf-inputs/expandable-input';
import { ADDED, ADDITIONAL_PROPERTIES, DELETION_MARK, PREVIOUS_VALUE } from '../../../../utils/field-constants';
import PropertyForm from './property-form';
import { fetchPredefinedProperties, initializedProperty, PredefinedProperties } from './property-utils';
import { useFormContext, useWatch } from 'react-hook-form';

type PropertiesFormProps = {
    networkElementType?: string;
    isModification?: boolean;
};

const PropertiesForm = ({ networkElementType, isModification = false }: PropertiesFormProps) => {
    const watchProps = useWatch({
        name: ADDITIONAL_PROPERTIES,
    });
    const { getValues, setValue } = useFormContext();
    const [predefinedProperties, setPredefinedProperties] = useState({} as PredefinedProperties);

    useEffect(() => {
        networkElementType &&
            fetchPredefinedProperties(networkElementType).then((res) => {
                if (res) {
                    setPredefinedProperties(res);
                }
            });
    }, [networkElementType]);

    const getDeletionMark = useCallback(
        (idx: number) => {
            const properties = getValues(`${ADDITIONAL_PROPERTIES}`);
            if (properties && typeof properties[idx] !== 'undefined') {
                return watchProps && properties[idx][DELETION_MARK];
            }
            return false;
        },
        [getValues, watchProps]
    );

    const deleteCallback = useCallback(
        (idx: number) => {
            let markedForDeletion = false;
            const properties = getValues(`${ADDITIONAL_PROPERTIES}`);
            if (properties && typeof properties[idx] !== 'undefined') {
                markedForDeletion = properties[idx][DELETION_MARK];
            } else {
                return false;
            }

            let canRemoveLine = true;
            if (markedForDeletion) {
                // just unmark
                setValue(`${ADDITIONAL_PROPERTIES}.${idx}.${DELETION_MARK}`, false, { shouldDirty: true });
                canRemoveLine = false;
            } else {
                // we should mark for deletion a property that actually exists in the network and not delete the property line straight away
                if (properties[idx][PREVIOUS_VALUE] && properties[idx][ADDED] === false) {
                    setValue(`${ADDITIONAL_PROPERTIES}.${idx}.${DELETION_MARK}`, true, { shouldDirty: true });
                    canRemoveLine = false;
                }
            }
            // otherwise just delete the line
            return canRemoveLine;
        },
        [getValues, setValue]
    );

    const modificationProperties = isModification
        ? {
              getDeletionMark,
              deleteCallback,
              watchProps,
          }
        : {};

    const additionalProps = (
        <ExpandableInput
            name={ADDITIONAL_PROPERTIES}
            Field={PropertyForm}
            fieldProps={{ predefinedProperties }}
            addButtonLabel={'AddProperty'}
            initialValue={initializedProperty()}
            {...modificationProperties}
        />
    );

    return (
        <Grid container>
            <GridSection title={'AdditionalInformation'} />
            {additionalProps}
        </Grid>
    );
};

export default PropertiesForm;
