import { Autocomplete, TextField } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import { FieldLabel } from '../../../dialogs/inputs/hooks-helpers';
import PropTypes from 'prop-types';

/**
 * Textfield used as select input controlled by react hook form
 * @param name field name, will be the name of the input returned when submiting the form
 * @param label field label id, will be translated
 * @param required required state to append '(optional)' to the end of the label
 * @param options select options, each option needs a label that will be translated and an id
 * @param control object used by react hook form to control the mui component
 * @param errorMessage errorMessage that will be displayed if not empty
 * @param rest input props to enhance the component
 * @returns
 */
const ReactHookFormAutocomplete = ({
    name,
    label,
    required = false,
    options,
    control,
    errorMessage,
    ...rest
}) => {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange } }) => (
                <Autocomplete
                    size="small"
                    fullWidth
                    onChange={onChange}
                    options={options}
                    renderInput={(params) => (
                        <TextField
                            label={FieldLabel({
                                label: label,
                                optional: !required,
                            })}
                            error={!!errorMessage}
                            helperText={errorMessage}
                            {...params}
                            {...rest}
                        />
                    )}
                />
            )}
        />
    );
};

ReactHookFormAutocomplete.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    options: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    }).isRequired,
    control: PropTypes.object.isRequired,
    errorMessage: PropTypes.string,
};

export default ReactHookFormAutocomplete;
