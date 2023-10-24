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
import { useIntl } from "react-intl";

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
    const intl = useIntl();
    const [referenceFieldOptions1, setReferenceFieldOptions1] = useState([]);
    const [referenceFieldOptions2, setReferenceFieldOptions2] = useState([]);
    const [displayOptions1, setDisplayOptions1] = useState(false);
    const [displayOptions2, setDisplayOptions2] = useState(false);

    const equipmentTypeWatch = useWatch({
        name: EQUIPMENT_TYPE_FIELD,
    });

    const equipmentFields = equipmentTypeWatch ? EQUIPMENTS_FIELDS[equipmentTypeWatch] ?? [] : [];

    const handleInputChange = useCallback(
        (evt: SyntheticEvent, setOptions: SetStateAction<any>, setDisplayOptions: SetStateAction<any>) => {
            const element = evt.target as HTMLInputElement;
            if (element.value && element.value.startsWith('#')) {
                const keyWord = element.value.substring(1).toLowerCase();
                console.log('equipmentField : ', equipmentFields);
                const newOptions =  equipmentFields.filter((field) => {
                    const translatedOption = intl.formatMessage({id: field.label}).toLowerCase();
                    console.log('test : ', translatedOption, keyWord, translatedOption.startsWith(keyWord));
                    return translatedOption.startsWith(keyWord);
                });
                console.log('newOptions : ', newOptions);
                setOptions(newOptions);
                setDisplayOptions(true);
            }
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
            size={'small'}
        />
    );

    const referenceField1 = (
        <AutocompleteInput
            name={`${name}.${index}.${REFERENCE_FIELD_OR_VALUE_1}`}
            options={referenceFieldOptions1}
            label={'ReferenceFieldOrValue'}
            onInputChange={(evt) =>
                handleInputChange(evt, setReferenceFieldOptions1, setDisplayOptions1)
            }
            size={'small'}
            open={displayOptions1}
            sx={{
                "& .MuiAutocomplete-endAdornment": {
                    display: "none",
                },
            }}
            onBlur={() => setDisplayOptions1(false)}
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
        <AutocompleteInput
            name={`${name}.${index}.${REFERENCE_FIELD_OR_VALUE_2}`}
            options={referenceFieldOptions2}
            label={'ReferenceFieldOrValue'}
            onInputChange={(evt) =>
                handleInputChange(evt, setReferenceFieldOptions2, setDisplayOptions2)
            }
            size={'small'}
            open={displayOptions2}
            sx={{
                "& .MuiAutocomplete-endAdornment": {
                    display: "none",
                },
            }}
            onBlur={() => setDisplayOptions2(false)}
        />
    );

    return (
        <>
            {gridItem(filtersField, 2.5)}
            {gridItem(editedField, 2.5)}
            {gridItem(referenceField1, 2.5)}
            {gridItem(operatorField, 1)}
            {gridItem(referenceField2, 2.5)}
        </>
    );
};

export default FormulaForm;
