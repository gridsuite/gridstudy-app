import React, { FunctionComponent } from 'react';
import { elementType, SelectInput } from '@gridsuite/commons-ui';
import {
    EDITED_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    OPERATOR,
    REFERENCE_FIELD_OR_VALUE_1,
    REFERENCE_FIELD_OR_VALUE_2,
} from '../../../../utils/field-constants';
import { useWatch } from 'react-hook-form';
import DirectoryItemsInput from '../../../../utils/rhf-inputs/directory-items-input';
import { gridItem } from '../../../dialogUtils';
import { EQUIPMENTS_FIELDS } from './formula-utils';
import ReferenceAutocompleteInput from './reference-autocomplete-input';
import DragHandleIcon from '@mui/icons-material/DragHandle';

interface FormulaProps {
    name: String;
    index: number;
}

const OPERATOR_OPTIONS = [
    { id: 'ADDITION', label: '+' },
    { id: 'SUBTRACTION', label: '-' },
    { id: 'MULTIPLICATION', label: '*' },
    { id: 'DIVISION', label: '/' },
    { id: 'MODULUS', label: '%' },
];
const FormulaForm: FunctionComponent<FormulaProps> = ({ name, index }) => {
    const equipmentTypeWatch = useWatch({
        name: EQUIPMENT_TYPE_FIELD,
    });

    const equipmentFields = equipmentTypeWatch
        ? EQUIPMENTS_FIELDS[equipmentTypeWatch] ?? []
        : [];

    const filtersField = (
        <DirectoryItemsInput
            name={`${name}.${index}.${FILTERS}`}
            equipmentTypes={[equipmentTypeWatch]}
            elementType={elementType.FILTER}
            label={'filter'}
            titleId={'FiltersListsSelection'}
        />
    );

    const editedField = (
        <SelectInput
            name={`${name}.${index}.${EDITED_FIELD}`}
            options={equipmentFields}
            label={'EditedField'}
            size={'small'}
        />
    );

    const referenceField1 = (
        <ReferenceAutocompleteInput
            name={`${name}.${index}.${REFERENCE_FIELD_OR_VALUE_1}`}
            options={equipmentFields}
        />
    );

    const operatorField = (
        <SelectInput
            name={`${name}.${index}.${OPERATOR}`}
            options={OPERATOR_OPTIONS}
            label={'Operator'}
            size={'small'}
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
            {gridItem(<DragHandleIcon />, 0.25)}
            {gridItem(referenceField1, 2.5)}
            {gridItem(operatorField, 1.25)}
            {gridItem(referenceField2, 2.5)}
        </>
    );
};

export default FormulaForm;
