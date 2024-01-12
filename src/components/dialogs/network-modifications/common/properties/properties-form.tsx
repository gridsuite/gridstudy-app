import { GridSection } from '../../../dialogUtils';
import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useState } from 'react';
import ExpandableInput from '../../../../utils/rhf-inputs/expandable-input';
import {
    ADDED,
    ADDITIONAL_PROPERTIES,
    DELETION_MARK,
    PREVIOUS_VALUE,
} from '../../../../utils/field-constants';
import PropertyForm from './property-form';
import {
    fetchPredefinedProperties,
    initializedProperty,
    PredefinedProperties,
} from './property-utils';
import { useFormContext, useWatch } from 'react-hook-form';

type PropertiesFormProps = {
    networkElementType: string;
    isModification?: boolean;
};

const PropertiesForm = ({
    networkElementType,
    isModification = false,
}: PropertiesFormProps) => {
    const watchProps = useWatch({
        name: ADDITIONAL_PROPERTIES,
    });
    const { getValues, setValue } = useFormContext();
    const [predefinedProperties, setPredefinedProperties] = useState(
        {} as PredefinedProperties
    );

    useEffect(() => {
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
        <>
            <Grid container>
                <GridSection title={'AdditionalInformations'} />
                {additionalProps}
            </Grid>
        </>
    );
};

export default PropertiesForm;
