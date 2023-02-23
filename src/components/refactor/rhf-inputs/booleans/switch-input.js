/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import BooleanInput from './boolean-input';
import Switch from '@mui/material/Switch';

const SwitchInput = ({ name, label, formProps }) => {
    return (
        <BooleanInput
            name={name}
            label={label}
            formProps={formProps}
            Input={Switch}
        />
    );
};

SwitchInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    formProps: PropTypes.object,
};

export default SwitchInput;
