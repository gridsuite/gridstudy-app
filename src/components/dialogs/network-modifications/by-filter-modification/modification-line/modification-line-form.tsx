/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useMemo } from 'react';
import {
    AutocompleteInput,
    DirectoryItemsInput,
    ElementType,
    FloatInput,
    IntegerInput,
    SelectInput,
    SwitchInput,
    TextInput,
} from '@gridsuite/commons-ui';
import { EDITED_FIELD, FILTERS, PROPERTY_NAME_FIELD, VALUE_FIELD } from '../../../../utils/field-constants';
import { useWatch } from 'react-hook-form';
import { gridItem } from '../../../dialogUtils';
import { DataType, FieldOptionType } from './modification-line-utils';
import { getIdOrValue, getLabelOrValue } from '../../../commons/utils';
import { useIntl } from 'react-intl';

interface ModificationLineFormProps {
    name: String;
    index: number;
    predefinedProperties: any;
    equipmentFields: FieldOptionType[];
    equipmentType: string;
}

const ModificationLineForm: FunctionComponent<ModificationLineFormProps> = ({
    name,
    index,
    predefinedProperties,
    equipmentFields,
    equipmentType,
}) => {
    const intl = useIntl();

    const watchEditedField = useWatch({
        name: `${name}.${index}.${EDITED_FIELD}`,
    });

    const dataType = useMemo(() => {
        return equipmentFields?.find((fieldOption) => fieldOption?.id === watchEditedField)?.dataType;
    }, [watchEditedField, equipmentFields]);

    const watchPropertyName = useWatch({
        name: `${name}.${index}.${PROPERTY_NAME_FIELD}`,
    });

    const predefinedPropertiesNames = useMemo(() => {
        return Object.keys(predefinedProperties ?? {}).sort();
    }, [predefinedProperties]);

    const predefinedPropertiesValues = useMemo(() => {
        return predefinedProperties?.[watchPropertyName]?.sort() ?? [];
    }, [watchPropertyName, predefinedProperties]);

    const options = useMemo(() => {
        return equipmentFields?.find((fieldOption) => fieldOption?.id === watchEditedField)?.values ?? [];
    }, [watchEditedField, equipmentFields]);

    const filtersField = (
        <DirectoryItemsInput
            name={`${name}.${index}.${FILTERS}`}
            equipmentTypes={[equipmentType]}
            elementType={ElementType.FILTER}
            label={'filter'}
            titleId={'FiltersListsSelection'}
            disable={!equipmentType}
        />
    );

    const editedField = (
        <AutocompleteInput
            name={`${name}.${index}.${EDITED_FIELD}`}
            options={equipmentFields}
            label={'EditedField'}
            size={'small'}
            inputTransform={(value: any) => equipmentFields.find((option) => option?.id === value) || value}
            outputTransform={(option: any) => getIdOrValue(option) ?? null}
            getOptionLabel={(option: any) => intl.formatMessage({ id: getLabelOrValue(option) })}
        />
    );

    const propertyNameField = (
        <AutocompleteInput
            name={`${name}.${index}.${PROPERTY_NAME_FIELD}`}
            options={predefinedPropertiesNames}
            label={'PropertyName'}
            size={'small'}
            allowNewValue
        />
    );

    const valueField = useMemo(() => {
        if (dataType === DataType.PROPERTY) {
            return (
                <AutocompleteInput
                    name={`${name}.${index}.${VALUE_FIELD}`}
                    label={'PropertyValue'}
                    options={predefinedPropertiesValues}
                    size={'small'}
                    allowNewValue
                />
            );
        }

        if (dataType === DataType.INTEGER) {
            return <IntegerInput name={`${name}.${index}.${VALUE_FIELD}`} label={'Value'} />;
        }

        if (dataType === DataType.BOOLEAN) {
            return <SwitchInput name={`${name}.${index}.${VALUE_FIELD}`} formProps={{ value: false }} />;
        }

        if (dataType === DataType.STRING) {
            return <TextInput name={`${name}.${index}.${VALUE_FIELD}`} label={'Value'} />;
        }

        if (dataType === DataType.ENUM) {
            return (
                <SelectInput name={`${name}.${index}.${VALUE_FIELD}`} label="Value" options={options} size={'small'} />
            );
        }

        // by default is a numeric type
        return <FloatInput name={`${name}.${index}.${VALUE_FIELD}`} label={'Value'} />;
    }, [dataType, name, index, predefinedPropertiesValues, options]);

    return (
        <>
            {gridItem(filtersField, 2.25)}
            {gridItem(editedField, 3)}
            {dataType === DataType.PROPERTY && gridItem(propertyNameField, 2.25)}
            {gridItem(valueField, dataType === DataType.PROPERTY ? 3.25 : 5.5)}
        </>
    );
};

export default ModificationLineForm;
