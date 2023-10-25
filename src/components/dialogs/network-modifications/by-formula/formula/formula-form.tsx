import React, { FunctionComponent, SetStateAction, SyntheticEvent, useCallback, useState } from "react";
import { AutocompleteInput, elementType, SelectInput } from "@gridsuite/commons-ui";
import {
    EDITED_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    OPERATOR,
    REFERENCE_FIELD_OR_VALUE_1,
    REFERENCE_FIELD_OR_VALUE_2
} from "../../../../utils/field-constants";
import { useController, useWatch } from "react-hook-form";
import DirectoryItemsInput from "../../../../utils/rhf-inputs/directory-items-input";
import Grid from "@mui/material/Grid";
import { gridItem } from "../../../dialogUtils";
import { EQUIPMENTS_FIELDS } from "./formula-utils";
import { useIntl } from "react-intl";
import { FilterOptionsState } from "@mui/material";

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

    const {field: {onChange}} = useController({
        name: `${name}.${index}.${REFERENCE_FIELD_OR_VALUE_2}`
    })
    const equipmentTypeWatch = useWatch({
        name: EQUIPMENT_TYPE_FIELD,
    });

    const equipmentFields = equipmentTypeWatch
        ? EQUIPMENTS_FIELDS[equipmentTypeWatch] ?? []
        : [];

    const handleInputChange = useCallback(
        (
            evt: SyntheticEvent,
            setOptions: SetStateAction<any>,
            setDisplayOptions: SetStateAction<any>
        ) => {
            const element = evt.target as HTMLInputElement;
            if (element.value && element.value.startsWith('#')) {
                const keyWord = element.value.substring(1).toLowerCase();
                const newOptions = keyWord
                    ? equipmentFields.filter((field) => {
                          const translatedOption = intl
                              .formatMessage({ id: field.label })
                              .toLowerCase();
                          return translatedOption.startsWith(keyWord);
                      })
                    : equipmentFields;
                setOptions(newOptions);
                setDisplayOptions(true);
            }
        },
        []
    );

    const handleFilterOptions = useCallback((options: string[],
                                             state: FilterOptionsState<string>,
                                             setDisplayOptions: SetStateAction<any>) => {
        if (state.inputValue?.startsWith('#')) {
            setDisplayOptions(true);
            const keyword = state.inputValue?.substring(1);
            const newOptions = options
              .map((option) =>
                intl.formatMessage({ id: state.getOptionLabel(option) })
              );
            if (!keyword) {
                return newOptions;
            }
            return newOptions
              .filter((option) => option.startsWith(keyword));
        }

        return []
    }, [])
    const filtersField = (
        <DirectoryItemsInput
            name={`${name}.${index}.${FILTERS}`}
            equipmentTypes={[equipmentTypeWatch]}
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
            size={'small'}
            open={displayOptions1}
            onBlur={() => setDisplayOptions1(false)}
            allowNewValue
            filterOptions={(
                options: string[],
                state: FilterOptionsState<string>
            ) => handleFilterOptions(options, state, setDisplayOptions1)}
            formProps={{
                helperText: intl.formatMessage({ id: 'Use#ToSelectField' }),
            }}
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

    const handleChange = useCallback((value: string) => {
            if (value?.startsWith('#')) {
                setDisplayOptions1(true);
                return value;
            }
            const sanitizedValue = value?.toString().replace(',', '.');
            if (['-', '.'].includes(sanitizedValue)) {
                console.log('sanitizedValue 1 : ', sanitizedValue);
                return sanitizedValue;
            }

            return sanitizedValue === null || isNaN(parseFloat(sanitizedValue))
              ? ''
              : sanitizedValue;
    }, [])

    const referenceField2 = (
        <AutocompleteInput
            name={`${name}.${index}.${REFERENCE_FIELD_OR_VALUE_2}`}
            options={referenceFieldOptions2}
            label={'ReferenceFieldOrValue'}
            size={'small'}
            open={displayOptions2}
            sx={{
                '& .MuiAutocomplete-endAdornment': {
                    display: 'none',
                },
            }}
            onBlur={() => setDisplayOptions2(false)}
            formProps={{
                helperText: intl.formatMessage({ id: 'Use#ToSelectField' }),
            }}
            filterOptions={(
              options: string[],
              state: FilterOptionsState<string>
            ) => handleFilterOptions(options, state, setDisplayOptions2)}
        />
    );

    return (
        <>
            {gridItem(filtersField, 2.25)}
            {gridItem(editedField, 2.25)}
            <Grid item xs={0.25} paddingTop={'25px'}>
                =
            </Grid>
            {gridItem(referenceField1, 2.5)}
            {gridItem(operatorField, 1.25)}
            {gridItem(referenceField2, 2.5)}
        </>
    );
};

export default FormulaForm;
