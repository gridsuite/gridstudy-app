/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { MenuItem, Select } from '@mui/material';
import { useController } from 'react-hook-form';
import { FieldLabel } from '@gridsuite/commons-ui';

// This input use Mui select instead of Autocomplete which can be needed some time (like in FormControl)
const MuiSelectInput = ({ name, options, ...props }) => {
    const {
        field: { value, label, onChange },
    } = useController({
        name,
    });

    const fieldLabel = !label
        ? null
        : FieldLabel({
              label,
          });

    return (
        <Select value={value} onChange={onChange} label={fieldLabel} {...props}>
            {options.map((option, index) => (
                <MenuItem key={index} value={option.id ?? option}>
                    <FormattedMessage id={option.label ?? option} />
                </MenuItem>
            ))}
        </Select>
    );
};

MuiSelectInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    options: PropTypes.array.isRequired,
};

export default MuiSelectInput;
