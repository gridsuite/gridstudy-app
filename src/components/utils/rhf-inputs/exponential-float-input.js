/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { TextInput } from '@gridsuite/commons-ui';

// copy from https://github.com/gridsuite/commons-ui/blob/b82955b4bb1901655176175f3bc2b508e0c7c154/src/components/FlatParameters/FlatParameters.js
// but add a small adjustment - => [-+]
const isFloatNumberWithScientific = (val) => {
    return /^-?\d*[.,]?\d*([eE][-+]?\d*)?$/.test(val);
};

// TODO move to common-ui, merge with FloatInput via a prop or as a separated component
const ExponentialFloatInput = (props) => {
    const inputTransform = (value) => {
        const sanitizedValue = value?.toString().replace(',', '.');
        if (['-', '.'].includes(sanitizedValue)) {
            return sanitizedValue;
        }

        // support editing exponential format
        if (
            sanitizedValue &&
            (sanitizedValue.includes('e') || sanitizedValue.includes('E'))
        ) {
            return sanitizedValue;
        }

        return sanitizedValue === null || isNaN(sanitizedValue)
            ? ''
            : sanitizedValue;
    };

    const outputTransform = (value) => {
        if (value === '-') {
            return value;
        }
        if (value === '') {
            return null;
        }

        const tmp = value?.replace(',', '.') || '';
        if (tmp.endsWith('.') || tmp.endsWith('0')) {
            return tmp;
        }

        // support editing exponential format
        if (tmp.includes('e') || tmp.includes('E')) {
            return tmp;
        }

        return parseFloat(tmp) || null;
    };

    return (
        <TextInput
            acceptValue={isFloatNumberWithScientific}
            outputTransform={outputTransform}
            inputTransform={inputTransform}
            {...props}
        />
    );
};

ExponentialFloatInput.propTypes = {
    ...TextInput.propTypes,
};

export default ExponentialFloatInput;
