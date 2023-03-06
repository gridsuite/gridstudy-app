/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import TextInput from './text-input';
import PropTypes from 'prop-types';
import { isFloatNumber } from '../../dialogs/inputs/input-hooks';

const FloatInput = (props) => {
    const inputTransform = (value) => {
        if (['-', '.'].includes(value)) return value;
        return value === null || isNaN(value) ? '' : value.toString();
    };

    const outputTransform = (value) => {
        if (value === '-') return value;
        if (value === '') return null;

        const tmp = value?.replace(',', '.') || '';
        if (tmp.endsWith('.') || tmp.endsWith('0')) return value;
        return parseFloat(tmp) || null;
    };

    return (
        <TextInput
            acceptValue={isFloatNumber}
            outputTransform={outputTransform}
            inputTransform={inputTransform}
            {...props}
        />
    );
};

FloatInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    labelValues: PropTypes.object,
    adornment: PropTypes.object,
    acceptValue: PropTypes.func,
    formProps: PropTypes.object,
    previousValue: PropTypes.any,
    clearable: PropTypes.bool,
};

export default FloatInput;
