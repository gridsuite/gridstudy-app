import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import PropTypes from 'prop-types';
import { useController } from 'react-hook-form';

const BooleanInput = ({ name, label, formProps }) => {
    const {
        field: { onChange, value },
    } = useController({ name });

    const intl = useIntl();

    const handleChangeValue = useCallback(
        (event) => {
            onChange(event.target.checked);
        },
        [onChange]
    );

    return (
        <FormControlLabel
            control={
                <Switch
                    checked={value}
                    onChange={(e) => handleChangeValue(e)}
                    value="checked"
                    inputProps={{
                        'aria-label': 'primary checkbox',
                    }}
                    {...formProps}
                />
            }
            label={intl.formatMessage({
                id: label,
            })}
        />
    );
};

BooleanInput.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func,
    formProps: PropTypes.object,
};

export default BooleanInput;
