/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useController } from 'react-hook-form';

const BooleanInput = ({ name, label, formProps, Input }) => {
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

    const CustomInput = (
        <Input
            checked={value}
            onChange={(e) => handleChangeValue(e)}
            inputProps={{
                'aria-label': 'primary checkbox',
            }}
            {...formProps}
        />
    );

    if (label) {
        return (
            <FormControlLabel
                control={CustomInput}
                label={intl.formatMessage({ id: label })}
            />
        );
    }

    return CustomInput;
};

BooleanInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    formProps: PropTypes.object,
    Input: PropTypes.elementType.isRequired,
};

export default BooleanInput;
