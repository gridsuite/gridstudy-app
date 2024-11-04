/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useMemo } from 'react';
import { AutocompleteInput } from '@gridsuite/commons-ui';
import { NAME, VALUE, PREVIOUS_VALUE, DELETION_MARK, ADDED } from 'components/utils/field-constants';
import { useWatch } from 'react-hook-form';
import { TextInput } from '@gridsuite/commons-ui';
import { PredefinedProperties } from './property-utils';
import { GridItem, italicFontTextField } from '../../../dialog-utils';

type PropertyFormProps = {
    name: string;
    index: string;
    predefinedProperties: PredefinedProperties;
};

const PropertyForm = ({ name, index, predefinedProperties }: PropertyFormProps) => {
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
                {watchPropertyDeletionMark || (watchPropertyAdded === false && watchPropertyPreviousValue) ? (
                    <GridItem field={nameReadOnlyField} size={5} />
                ) : (
                    <GridItem field={nameField} size={5} />
                )}
                {watchPropertyDeletionMark ? (
                    <GridItem field={valueReadOnlyField} size={5} />
                ) : (
                    <GridItem field={valueField} size={5} />
                )}
            </>
        );
    }

    return renderPropertyLine();
};

export default PropertyForm;
