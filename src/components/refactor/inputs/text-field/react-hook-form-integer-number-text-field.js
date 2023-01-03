import { TextField } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import { toIntOrEmptyValue } from '../../../dialogs/dialogUtils';
import {
    FieldLabel,
    genHelperError,
} from '../../../dialogs/inputs/hooks-helpers';
import PropTypes from 'prop-types';

/**
 * Textfield only accepting integers as input controlled by react hook form
 * @param name field name, will be the name of the input returned when submiting the form
 * @param label field label id, will be translated
 * @param required required state to append '(optional)' to the end of the label
 * @param control object used by react hook form to control the mui component
 * @param errorMessage errorMessage that will be displayed if not empty
 * @param rest input props to enhance the component
 * @returns
 */
const ReactHookFormIntegerNumberTextField = ({
    name,
    label,
    required = false,
    control,
    ...rest
}) => {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                    size="small"
                    fullWidth
                    value={value}
                    onChange={(e) => {
                        onChange(toIntOrEmptyValue(e.target.value));
                    }}
                    label={FieldLabel({ label: label, optional: !required })}
                    {...genHelperError(error?.message)}
                    {...rest}
                />
            )}
        />
    );
};

ReactHookFormIntegerNumberTextField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    control: PropTypes.object.isRequired,
};

export default ReactHookFormIntegerNumberTextField;
