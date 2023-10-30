import React, { FunctionComponent, useCallback, useState } from 'react';
import { useController } from 'react-hook-form';
import { FilterOptionsState } from '@mui/material';
import { useIntl } from 'react-intl';
import { AutocompleteInput } from '@gridsuite/commons-ui';
import { areIdsEqual } from '../../../../utils/utils';

const ReferenceAutocompleteInput: FunctionComponent<{
    name: string;
    options: { id: string; label: string }[];
}> = ({ name, options }) => {
    const intl = useIntl();
    const [displayOptions, setDisplayOptions] = useState(false);
    const {
        fieldState: { error },
        field: { onChange },
    } = useController({
        name,
    });

    const handleFilterOptions = useCallback(
        (
            options: ({ id: string; label: string } | string)[],
            state: FilterOptionsState<string | { id: string; label: string }>
        ) => {
            if (state.inputValue?.startsWith('#')) {
                const keyword = state.inputValue?.substring(1);
                if (!keyword) {
                    return options;
                }
                return options.filter((option) =>
                    intl
                        .formatMessage({ id: state.getOptionLabel(option) })
                        .startsWith(keyword)
                );
            }

            return options;
        },
        [intl]
    );

    return (
        <AutocompleteInput
            name={name}
            options={options}
            isOptionEqualToValue={areIdsEqual}
            getOptionLabel={(option: any) => {
                return option?.label
                    ? intl.formatMessage({ id: option.label })
                    : option;
            }}
            label={'ReferenceFieldOrValue'}
            size={'small'}
            open={displayOptions}
            onBlur={() => setDisplayOptions(false)}
            allowNewValue
            onInputChange={(event, value) => {
                const displayOption = !!value?.startsWith('#');
                setDisplayOptions(displayOption);

                const matchingOption = options.find(
                    (option) =>
                        intl.formatMessage({ id: option.label }) ===
                        value?.substring(1)
                );
                //if it does, we send the matching option to react hook form
                if (matchingOption) {
                    onChange(matchingOption);
                    return;
                }
                onChange(value);
            }}
            filterOptions={(
                options: ({ id: string; label: string } | string)[],
                state: FilterOptionsState<
                    string | { id: string; label: string }
                >
            ) => handleFilterOptions(options, state)}
            formProps={{
                helperText: intl.formatMessage({
                    id: error?.message ? error.message : 'Use#ToSelectField',
                }),
            }}
        />
    );
};

export default ReferenceAutocompleteInput;
