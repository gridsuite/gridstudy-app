/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FC, useMemo } from 'react';
import {
    AutocompleteInput,
    DirectoryItemsInput,
    ElementType,
    FloatInput,
    IntegerInput,
    SelectInput,
    SwitchInput,
    usePrevious,
} from '@gridsuite/commons-ui';
import DensityLargeIcon from '@mui/icons-material/DensityLarge';
import { EDITED_FIELD, FILTERS, PROPERTY_NAME_FIELD, VALUE_FIELD } from '../../../../../utils/field-constants';
import { useFormContext, useWatch } from 'react-hook-form';
import { gridItem } from '../../../../dialogUtils';
import { getIdOrValue, getLabelOrValue } from '../../../../commons/utils';
import { useIntl } from 'react-intl';
import { DataType, FieldOptionType } from './assignment.type';
import { areIdsEqual, comparatorStrIgnoreCase } from '../../../../../utils/utils';
import { PredefinedProperties } from '../../../common/properties/property-utils';

interface AssignmentFormProps {
    name: string;
    index: number;
    predefinedProperties: PredefinedProperties;
    equipmentFields: FieldOptionType[];
    equipmentType: string;
}

const AssignmentForm: FC<AssignmentFormProps> = ({
    name,
    index,
    predefinedProperties,
    equipmentFields,
    equipmentType,
}) => {
    const intl = useIntl();

    const { setValue } = useFormContext();

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
        return Object.keys(predefinedProperties ?? {}).sort(comparatorStrIgnoreCase);
    }, [predefinedProperties]);

    const predefinedPropertiesValues = useMemo(() => {
        return [...(predefinedProperties?.[watchPropertyName] ?? [])].sort(comparatorStrIgnoreCase);
    }, [watchPropertyName, predefinedProperties]);

    const options = useMemo(() => {
        return equipmentFields?.find((fieldOption) => fieldOption?.id === watchEditedField)?.values ?? [];
    }, [watchEditedField, equipmentFields]);

    // reset value field only when data type is changed
    const prevDataType = usePrevious(dataType);
    // important, check prevDataType should not be undefined to ensure that setValue is not called in initialization
    if (prevDataType && prevDataType !== dataType) {
        setValue(`${name}.${index}.${VALUE_FIELD}`, dataType === DataType.BOOLEAN ? false : null);
    }

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
            getOptionLabel={(option: any) => (option ? intl.formatMessage({ id: getLabelOrValue(option) }) : option)}
            isOptionEqualToValue={areIdsEqual}
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
            return <IntegerInput name={`${name}.${index}.${VALUE_FIELD}`} label="Value" />;
        }

        if (dataType === DataType.BOOLEAN) {
            return <SwitchInput name={`${name}.${index}.${VALUE_FIELD}`} formProps={{ value: false }} />;
        }

        if (dataType === DataType.ENUM) {
            return (
                <SelectInput name={`${name}.${index}.${VALUE_FIELD}`} label="Value" options={options} size={'small'} />
            );
        }

        // by default is a numeric type
        return <FloatInput name={`${name}.${index}.${VALUE_FIELD}`} label="Value" />;
    }, [dataType, name, index, predefinedPropertiesValues, options]);

    return (
        <>
            {gridItem(filtersField, 3.25)}
            {gridItem(editedField, 3)}
            <>
                {dataType === DataType.PROPERTY && gridItem(propertyNameField, 2.0)}
                {gridItem(<DensityLargeIcon fontSize="small" sx={{ marginTop: 1 }} />, 0.25)}
            </>
            {gridItem(valueField, dataType === DataType.PROPERTY ? 2.25 : 4.25)}
        </>
    );
};

export default AssignmentForm;
