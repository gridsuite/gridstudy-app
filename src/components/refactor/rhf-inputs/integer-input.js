/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import TextInput from './text-input';
import PropTypes from 'prop-types';
import { toPositiveIntValue } from 'components/dialogs/dialogUtils';

const IntegerInput = (props, isPositive) => {
    const inputTransform = (value) => {
        if ('-' === value) return value;
        return value === null || isNaN(value) ? '' : value.toString();
    };

    const toIntOrNullValue = (value) => {
        if (value === '-') return value;
        if (value === '0') return 0;
        return parseInt(value) || null;
    };

    return (
        <TextInput
            outputTransform={isPositive ? toPositiveIntValue : toIntOrNullValue}
            inputTransform={inputTransform}
            {...props}
        />
    );
};

IntegerInput.propTypes = {
    label: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    isPositive: PropTypes.bool,
    errorMessage: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func,
    adornment: PropTypes.object,
    customAdornment: PropTypes.object,
    transformValue: PropTypes.func,
    acceptValue: PropTypes.func,
    formProps: PropTypes.object,
    previousValue: PropTypes.object,
    clearable: PropTypes.bool,
};

export default IntegerInput;
