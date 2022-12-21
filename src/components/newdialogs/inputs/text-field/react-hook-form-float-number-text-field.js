import { TextField } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import { toFloatValue } from '../../../dialogs/dialogUtils';
import {
    FieldLabel,
    genHelperError,
} from '../../../dialogs/inputs/hooks-helpers';
import { isFloatNumber } from '../../../dialogs/inputs/input-hooks';
import PropTypes from 'prop-types';

/**
 * Textfield only accepting floats as input controlled by react hook form
 * @param name field name, will be the name of the input returned when submiting the form
 * @param label field label id, will be translated
 * @param required required state to append '(optional)' to the end of the label
 * @param control object used by react hook form to control the mui component
 * @param errorMessage errorMessage that will be displayed if not empty
 * @param rest input props to enhance the component
 * @returns
 */
const ReactHookFormFloatNumberTextField = ({
    name,
    label,
    required = false,
    control,
    errorMessage,
    ...rest
}) => {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
                <TextField
                    size="small"
                    fullWidth
                    value={value}
                    onChange={(e) => {
                        if (isFloatNumber(e.target.value))
                            onChange(toFloatValue(e.target.value));
                        else return;
                    }}
                    label={FieldLabel({ label: label, optional: !required })}
                    {...genHelperError(errorMessage)}
                    {...rest}
                />
            )}
        />
    );
};

ReactHookFormFloatNumberTextField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    control: PropTypes.object.isRequired,
    errorMessage: PropTypes.string,
};

export default ReactHookFormFloatNumberTextField;
