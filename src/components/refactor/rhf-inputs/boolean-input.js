/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
