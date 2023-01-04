/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MenuItem, TextField } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
    FieldLabel,
    genHelperError,
    genHelperPreviousValue,
} from '../../dialogs/inputs/hooks-helpers';
import PropTypes from 'prop-types';

const SelectInput = ({
    onChange,
    value,
    label,
    isRequired = false,
    options,
    previousValue,
    errorMsg,
    ...props
}) => {
    return (
        <TextField
            select
            value={value}
            label={FieldLabel({
                label: label,
                optional: !isRequired,
            })}
            size="small"
            onChange={onChange}
            {...genHelperPreviousValue(previousValue)}
            {...genHelperError(errorMsg)}
            {...props}
        >
            {options.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                    <FormattedMessage id={option.label} />
                </MenuItem>
            ))}
        </TextField>
    );
};

SelectInput.propTypes = {
    label: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    options: PropTypes.array.isRequired,
    errorMessage: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func,
    previousValue: PropTypes.object,
};

export default SelectInput;
