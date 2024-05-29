/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback } from 'react';
import {
    AutocompleteInput,
    DirectoryItemsInput,
    ElementType,
    Option,
} from '@gridsuite/commons-ui';
import {
    EDITED_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    OPERATOR,
    REFERENCE_FIELD_OR_VALUE_1,
    REFERENCE_FIELD_OR_VALUE_2,
} from '../../../../utils/field-constants';
import { useController, useWatch } from 'react-hook-form';
import { gridItem } from '../../../dialogUtils';
import { EQUIPMENTS_FIELDS } from './formula-utils';
import ReferenceAutocompleteInput from './reference-autocomplete-input';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { getIdOrValue, getLabelOrValue } from '../../../commons/utils';
import { useIntl } from 'react-intl';
import Grid from '@mui/material/Grid';

interface FormulaProps {
    name: string;
    index: number;
}

export const OPERATOR_OPTIONS: Exclude<Option, string>[] = [
    { id: 'ADDITION', label: '+' },
    { id: 'SUBTRACTION', label: '-' },
    { id: 'MULTIPLICATION', label: '*' },
    { id: 'DIVISION', label: '/' },
    { id: 'PERCENTAGE', label: '%' },
];

function operatorInputTransform(value: Option | null) {
    return (
        OPERATOR_OPTIONS.find((option) => option?.id === getIdOrValue(value)) ??
        value
    );
}

const FormulaForm: FunctionComponent<FormulaProps> = ({ name, index }) => {
    const equipmentTypeWatch = useWatch({
        name: EQUIPMENT_TYPE_FIELD,
    });

    const intl = useIntl();

    const equipmentFields = EQUIPMENTS_FIELDS?.[equipmentTypeWatch] ?? [];

    const filtersField = (
        <DirectoryItemsInput
            name={`${name}.${index}.${FILTERS}`}
            equipmentTypes={[equipmentTypeWatch]}
            elementType={ElementType.FILTER}
            label="filter"
            titleId="FiltersListsSelection"
            disable={!equipmentTypeWatch}
        />
    );

    const editedField = (
        <AutocompleteInput
            name={`${name}.${index}.${EDITED_FIELD}`}
            options={equipmentFields}
            label="EditedField"
            size="small"
            inputTransform={(value: Option | null) =>
                equipmentFields.find((option) => option?.id === value) || value
            }
            outputTransform={getIdOrValue}
            getOptionLabel={(option: Option) =>
                intl.formatMessage({ id: getLabelOrValue(option) })
            }
        />
    );

    const {
        field: { onChange, value, ref },
        fieldState: { error },
    } = useController({ name });

    const referenceField1 = (
        <ReferenceAutocompleteInput
            name={`${name}.${index}.${REFERENCE_FIELD_OR_VALUE_1}`}
            options={equipmentFields}
        />
    );

    const operatorField = (
        <AutocompleteInput
            name={`${name}.${index}.${OPERATOR}`}
            options={OPERATOR_OPTIONS}
            readOnly
            label="Operator"
            size="small"
            inputTransform={operatorInputTransform}
            outputTransform={getIdOrValue}
            getOptionLabel={getLabelOrValue}
        />
    );

    const referenceField2 = (
        <ReferenceAutocompleteInput
            name={`${name}.${index}.${REFERENCE_FIELD_OR_VALUE_2}`}
            options={equipmentFields}
        />
    );

    return (
        <>
            {gridItem(filtersField, 2.25)}
            {gridItem(editedField, 2.25)}
            <Grid item xs={0.25} sx={{ marginTop: 0.75 }}>
                <DragHandleIcon />
            </Grid>
            {gridItem(referenceField1, 2.5)}
            {gridItem(operatorField, 1.25)}
            {gridItem(referenceField2, 2.5)}
        </>
    );
};

export default FormulaForm;
