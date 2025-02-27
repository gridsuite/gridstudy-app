/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import { AutocompleteInput, DirectoryItemsInput, ElementType, useFormatLabelWithUnit } from '@gridsuite/commons-ui';
import {
    EDITED_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    OPERATOR,
    REFERENCE_FIELD_OR_VALUE_1,
    REFERENCE_FIELD_OR_VALUE_2,
} from '../../../../../utils/field-constants';
import { useWatch } from 'react-hook-form';
import { EQUIPMENTS_FIELDS } from './formula-utils';
import ReferenceAutocompleteInput from './reference-autocomplete-input';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { getIdOrValue, getLabelOrValue } from '../../../../commons/utils';
import { Grid } from '@mui/material';
import GridItem from '../../../../commons/grid-item';

interface FormulaProps {
    name: string;
    index: number;
}

const OPERATOR_OPTIONS = [
    { id: 'ADDITION', label: '+' },
    { id: 'SUBTRACTION', label: '-' },
    { id: 'MULTIPLICATION', label: '*' },
    { id: 'DIVISION', label: '/' },
    { id: 'PERCENTAGE', label: '%' },
];
const FormulaForm: FunctionComponent<FormulaProps> = ({ name, index }) => {
    const equipmentTypeWatch = useWatch({
        name: EQUIPMENT_TYPE_FIELD,
    });
    const equipmentFields: { id: string; label: string; unit: string }[] =
        // @ts-expect-error TODO: missing type in context
        EQUIPMENTS_FIELDS?.[equipmentTypeWatch] ?? [];

    const formatLabelWithUnit = useFormatLabelWithUnit();

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
            inputTransform={(value: any) => equipmentFields.find((option) => option?.id === value) || value}
            outputTransform={(option: any) => getIdOrValue(option) ?? null}
            getOptionLabel={(option: any) => formatLabelWithUnit(option)}
        />
    );

    const referenceField1 = (
        <ReferenceAutocompleteInput name={`${name}.${index}.${REFERENCE_FIELD_OR_VALUE_1}`} options={equipmentFields} />
    );

    const inputTransform = (value: { id: string; label: string } | string | null) => {
        const newVal = value ?? null;
        return OPERATOR_OPTIONS.find((option) => option?.id === getIdOrValue(value)) || newVal;
    };

    const operatorField = (
        <AutocompleteInput
            name={`${name}.${index}.${OPERATOR}`}
            options={OPERATOR_OPTIONS}
            readOnly
            label={'Operator'}
            size={'small'}
            inputTransform={inputTransform}
            outputTransform={getIdOrValue}
            getOptionLabel={getLabelOrValue}
        />
    );

    const referenceField2 = (
        <ReferenceAutocompleteInput name={`${name}.${index}.${REFERENCE_FIELD_OR_VALUE_2}`} options={equipmentFields} />
    );

    return (
        <>
            <GridItem size={2.25}>{filtersField}</GridItem>
            <GridItem size={2.25}>{editedField}</GridItem>
            <Grid item xs={0.25} sx={{ marginTop: 0.75 }}>
                <DragHandleIcon />
            </Grid>
            <GridItem size={2.5}>{referenceField1}</GridItem>
            <GridItem size={1.25}>{operatorField}</GridItem>
            <GridItem size={2.5}>{referenceField2}</GridItem>
        </>
    );
};

export default FormulaForm;
