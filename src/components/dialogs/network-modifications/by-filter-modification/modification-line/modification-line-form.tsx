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
} from '@gridsuite/commons-ui';
import {
    EDITED_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    PROPERTY_NAME_FIELD,
    VALUE_FIELD,
} from '../../../../utils/field-constants';
import { useWatch } from 'react-hook-form';
import { gridItem } from '../../../dialogUtils';
import { EQUIPMENTS_FIELDS } from './modification-line-utils';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { getIdOrValue, getLabelOrValue } from '../../../commons/utils';
import { useIntl } from 'react-intl';
import Grid from '@mui/material/Grid';

interface ModificationLineFormProps {
    name: String;
    index: number;
    predefinedProperties: any;
}

const ModificationLineForm: FunctionComponent<ModificationLineFormProps> = ({
    name,
    index,
    predefinedProperties,
}) => {
    const equipmentTypeWatch = useWatch({
        name: EQUIPMENT_TYPE_FIELD,
    });

    const intl = useIntl();

    const equipmentFields = EQUIPMENTS_FIELDS?.[equipmentTypeWatch] ?? [];

    const watchPropertyName = useWatch({
        name: `${name}.${index}.${PROPERTY_NAME_FIELD}`,
    });

    const predefinedNames = useMemo(() => {
        return Object.keys(predefinedProperties ?? {}).sort();
    }, [predefinedProperties]);

    const predefinedValues = useMemo(() => {
        return predefinedProperties?.[watchPropertyName]?.sort() ?? [];
    }, [watchPropertyName, predefinedProperties]);

    const filtersField = (
        <DirectoryItemsInput
            name={`${name}.${index}.${FILTERS}`}
            equipmentTypes={[equipmentTypeWatch]}
            elementType={ElementType.FILTER}
            label={'filter'}
            titleId={'FiltersListsSelection'}
            disable={!equipmentTypeWatch}
        />
    );

    const editedField = (
        <AutocompleteInput
            name={`${name}.${index}.${EDITED_FIELD}`}
            options={equipmentFields}
            label={'EditedField'}
            size={'small'}
            inputTransform={(value: any) =>
                equipmentFields.find((option) => option?.id === value) || value
            }
            outputTransform={(option: any) => getIdOrValue(option) ?? null}
            getOptionLabel={(option: any) =>
                intl.formatMessage({ id: getLabelOrValue(option) })
            }
        />
    );

    const propertyNameField = (
        <AutocompleteInput
            name={`${name}.${index}.${PROPERTY_NAME_FIELD}`}
            options={predefinedNames}
            label={'PropertyName'}
            size={'small'}
            allowNewValue
        />
    );

    const valueField = (
        <AutocompleteInput
            name={`${name}.${index}.${VALUE_FIELD}`}
            label={'PropertyValue'}
            options={predefinedValues}
            size={'small'}
            allowNewValue
        />
    );

    return (
        <>
            {gridItem(filtersField, 2.25)}
            {gridItem(editedField, 3)}
            {gridItem(propertyNameField, 2.25)}
            <Grid item xs={0.25} sx={{ marginTop: 0.75 }}>
                <DragHandleIcon />
            </Grid>
            {gridItem(valueField, 3.25)}
        </>
    );
};

export default ModificationLineForm;
