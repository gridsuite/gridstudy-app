import React, { useCallback, useMemo } from 'react';
import { Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import { useFormContext, useWatch } from 'react-hook-form';
import { CRITERIA_BASED } from '../../utils/field-constants';
import AutocompleteInput from 'components/utils/rhf-inputs/autocomplete-input';

export const PROPERTY_NAME = 'name_property';
export const PROPERTY_VALUES = 'prop_values';
export const PROPERTY_VALUES_1 = 'prop_values1';
export const PROPERTY_VALUES_2 = 'prop_values2';
export const FILTER_PROPERTIES = 'freeProperties';
interface FilterPropertyProps {
    index: number;
    valuesFields: Array<{ name: string; label: string }>;
    handleDelete: Function;
    predefined: any;
}

function FilterProperty(props: FilterPropertyProps) {
    const { setValue } = useFormContext();

    const watchName = useWatch({
        name: `${CRITERIA_BASED}.${FILTER_PROPERTIES}[${props.index}].${PROPERTY_NAME}`,
    });

    const predefinedNames = useMemo(() => {
        return Object.keys(props.predefined ?? []).sort();
    }, [props.predefined]);

    const predefinedValues = useMemo(() => {
        const predefinedForName = props.predefined?.[watchName];
        if (!predefinedForName) {
            return [];
        }
        return [...new Set(predefinedForName)].sort();
    }, [watchName, props.predefined]);

    // We reset values when name change
    const onNameChange = useCallback(() => {
        props.valuesFields.forEach((valuesField) =>
            setValue(
                `${CRITERIA_BASED}.${FILTER_PROPERTIES}[${props.index}].${valuesField.name}`,
                []
            )
        );
    }, [setValue, props.index, props.valuesFields]);

    return (
        <Grid container item spacing={1} columns={21}>
            <Grid item xs={6}>
                <AutocompleteInput
                    name={`${CRITERIA_BASED}.${FILTER_PROPERTIES}[${props.index}].${PROPERTY_NAME}`}
                    label={'PropertyName'}
                    options={predefinedNames}
                    freeSolo
                    forcePopupIcon
                    onChangeCallback={onNameChange}
                    // we have to fill these fields even if we don't use it because we use strict TS
                    previousValue={undefined}
                    formProps={undefined}
                    allowNewValue={undefined}
                />
            </Grid>
            {props.valuesFields.map((valuesField) => (
                <Grid item xs key={valuesField.name}>
                    <AutocompleteInput
                        name={`${CRITERIA_BASED}.${FILTER_PROPERTIES}[${props.index}].${valuesField.name}`}
                        label={valuesField.label}
                        options={predefinedValues}
                        freeSolo
                        forcePopupIcon
                        multiple
                        renderTags={(val: string[], getTagsProps: any) =>
                            val.map((option: string, index: number) => (
                                <Chip
                                    size={'small'}
                                    label={option}
                                    {...getTagsProps({ index })}
                                />
                            ))
                        }
                        // we have to fill these fields even if we don't use it because we use strict TS
                        previousValue={undefined}
                        formProps={undefined}
                        allowNewValue={undefined}
                        onChangeCallback={undefined}
                    />
                </Grid>
            ))}
            <Grid item xs={1} alignSelf="center">
                <IconButton onClick={() => props.handleDelete(props.index)}>
                    <DeleteIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
}

export default FilterProperty;
