import { gridItem } from '../../../../dialogs/dialogUtils';
import React, { useEffect, useMemo, useState } from 'react';
import AutocompleteInput from '../../../rhf-inputs/autocomplete-input';
import {NAME, VALUE, VARIATION_MODE} from '../../../utils/field-constants';
import { fetchPredefinedProperties } from './property-utils';
import { useWatch } from 'react-hook-form';

const PropertyForm = ({ name, index }) => {
    const [predefinedProperties, setPredefinedProperties] = useState();
    const propertyName = useWatch({ name: `${name}.${index}.${NAME}` });

    const predefinedNames = useMemo(() => {
        return Object.keys(predefinedProperties ?? {}).sort();
    }, [predefinedProperties]);

    const predefinedValues = useMemo(() => {
        return predefinedProperties?.[propertyName]?.sort() ?? [];
    }, [propertyName, predefinedProperties]);

    useEffect(() => {
        const fetchPromise = fetchPredefinedProperties();
        if (fetchPromise) {
            fetchPromise.then((res) => {
                if (res?.substation) {
                    setPredefinedProperties(res.substation);
                }
            });
        }
    }, []);

    const nameField = (
        <AutocompleteInput
            name={`${name}.${index}.${NAME}`}
            options={predefinedNames}
            label={'PropertyName'}
            size={'small'}
        />
    );

    const valueField = (
        <AutocompleteInput
            name={`${name}.${index}.${VALUE}`}
            options={predefinedValues}
            label={'PropertyValue'}
            size={'small'}
        />
    );

    return (
        <>
            {gridItem(nameField, 5)}
            {gridItem(valueField, 5)}
        </>
    );
};

export default PropertyForm;
