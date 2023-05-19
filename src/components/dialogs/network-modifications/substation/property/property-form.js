/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { gridItem, italicFontTextField } from '../../../dialogUtils';
import React, { useEffect, useMemo, useState } from 'react';
import AutocompleteInput from 'components/utils/rhf-inputs/autocomplete-input';
import {
    NAME,
    VALUE,
    PREVIOUS_VALUE,
    DELETION_MARK,
    ADDED,
} from 'components/utils/field-constants';
import { fetchPredefinedProperties } from './property-utils';
import { useWatch } from 'react-hook-form';
import TextInput from 'components/utils/rhf-inputs/text-input';

const PropertyForm = ({ name, index }) => {
    const [predefinedProperties, setPredefinedProperties] = useState();
    const watchPropertyName = useWatch({ name: `${name}.${index}.${NAME}` });
    const watchPropertyPreviousValue = useWatch({
        name: `${name}.${index}.${PREVIOUS_VALUE}`,
    });
    const watchPropertyDeletionMark = useWatch({
        name: `${name}.${index}.${DELETION_MARK}`,
    });
    const watchPropertyAdded = useWatch({
        name: `${name}.${index}.${ADDED}`,
    });

    const predefinedNames = useMemo(() => {
        return Object.keys(predefinedProperties ?? {}).sort();
    }, [predefinedProperties]);

    const predefinedValues = useMemo(() => {
        return predefinedProperties?.[watchPropertyName]?.sort() ?? [];
    }, [watchPropertyName, predefinedProperties]);

    useEffect(() => {
        fetchPredefinedProperties().then((res) => {
            if (res?.substation) {
                setPredefinedProperties(res.substation);
            }
        });
    }, []);

    const nameField = (
        <AutocompleteInput
            name={`${name}.${index}.${NAME}`}
            options={predefinedNames}
            label={'PropertyName'}
            size={'small'}
            allowNewValue
        />
    );

    const nameReadOnlyField = (
        <TextInput
            name={`${name}.${index}.${NAME}`}
            label={'PropertyName'}
            formProps={{ disabled: true, ...italicFontTextField }}
        />
    );

    const valueField = (
        <AutocompleteInput
            name={`${name}.${index}.${VALUE}`}
            options={predefinedValues}
            label={'PropertyValue'}
            size={'small'}
            allowNewValue
            previousValue={watchPropertyPreviousValue}
        />
    );

    const valueReadOnlyField = (
        <TextInput
            name={`${name}.${index}.${VALUE}`}
            label={'PropertyValue'}
            previousValue={watchPropertyPreviousValue}
            formProps={{ disabled: true, ...italicFontTextField }}
        />
    );

    function renderPropertyLine() {
        return (
            <>
                {watchPropertyDeletionMark ||
                (watchPropertyAdded === false && watchPropertyPreviousValue)
                    ? gridItem(nameReadOnlyField, 5)
                    : gridItem(nameField, 5)}
                {watchPropertyDeletionMark
                    ? gridItem(valueReadOnlyField, 5)
                    : gridItem(valueField, 5)}
            </>
        );
    }

    return renderPropertyLine();
};

export default PropertyForm;
