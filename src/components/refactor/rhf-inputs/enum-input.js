/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { FieldLabel } from '../../dialogs/inputs/hooks-helpers';
import { useController } from 'react-hook-form';
const EnumInput = ({ options, name, label, size }) => {
    const {
        field: { onChange, value },
        fieldState: { error },
    } = useController({ name });

    return (
        <FormControl fullWidth size={size} error={error ? true : false}>
            <InputLabel id="enum-type-label">
                <FieldLabel label={label} />
            </InputLabel>
            <Select
                label={label}
                id={label}
                value={value}
                fullWidth
                onChange={onChange}
            >
                {options.map((e) => (
                    <MenuItem value={e.id} key={e.label}>
                        <em>
                            <FormattedMessage id={e.label} />
                        </em>
                    </MenuItem>
                ))}
            </Select>
            {error?.message && (
                <FormHelperText>
                    <FormattedMessage id={error.message} />
                </FormHelperText>
            )}
        </FormControl>
    );
};

EnumInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    previousValue: PropTypes.object,
};

export default EnumInput;
