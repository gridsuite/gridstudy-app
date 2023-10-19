import {
    FunctionComponent, SetStateAction,
    SyntheticEvent,
    useCallback,
    useState
} from "react";
import {
    AutocompleteInput,
    elementType,
    SelectInput,
} from '@gridsuite/commons-ui';
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
import Grid from '@mui/material/Grid';
import { gridItem } from '../../../dialogUtils';
import { EQUIPMENTS_FIELDS } from './formula-utils';

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
    const [referenceFieldOptions1, setReferenceFieldOptions1] = useState([]);
    const [referenceFieldOptions2, setReferenceFieldOptions2] = useState([]);

    const equipmentTypeWatch = useWatch({
        name: EQUIPMENT_TYPE_FIELD,
    });

    const equipmentFields = EQUIPMENTS_FIELDS[equipmentTypeWatch];

    const handleInputChange = useCallback(
        (evt: SyntheticEvent, setOptions: SetStateAction<any>) => {
            console.log('evt ', evt);
            console.log('evt target ', evt?.target);
        },
        []
    );

    const filtersField = (
        <DirectoryItemsInput
            name={`${name}.${index}.${FILTERS}`}
            equipmentTypes={equipmentTypeWatch}
            elementType={elementType.FILTER}
            label={'filter'}
            titleId={'FiltersListsSelection'}
            //itemFilter={itemFilter}
        />
    );

    const editedField = (
        <SelectInput
            name={`${name}.${index}.${EDITED_FIELD}`}
            options={equipmentFields}
            label={'EditedField'}
        />
    );

    const referenceField1 = (
        <AutocompleteInput
            name={`${name}.${index}.${REFERENCE_FIELD_OR_VALUE_1}`}
            options={referenceFieldOptions1}
            label={'ReferenceFieldOrValue'}
            onInputChange={(evt) =>
                handleInputChange(evt, setReferenceFieldOptions1)
            }
        />
    );

    const operatorField = (
        <SelectInput
            name={`${name}.${index}.${OPERATOR}`}
            options={OPERATOR_OPTIONS}
            label={'Operator'}
        />
    );

    const referenceField2 = (
        <AutocompleteInput
            name={`${name}.${index}.${REFERENCE_FIELD_OR_VALUE_2}`}
            options={referenceFieldOptions2}
            label={'ReferenceFieldOrValue'}
            onInputChange={(evt) =>
                handleInputChange(evt, setReferenceFieldOptions2)
            }
        />
    );

    return (
        <Grid container spacing={2} columns={14}>
            {gridItem(filtersField, 3)}
            {gridItem(editedField, 3)}
            {gridItem(referenceField1, 3)}
            {gridItem(operatorField, 2)}
            {gridItem(referenceField2, 3)}
        </Grid>
    );
};

export default FormulaForm;
