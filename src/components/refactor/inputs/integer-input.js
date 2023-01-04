/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { toIntValue } from '../../dialogs/dialogUtils';
import TextInput from './text-input';
import PropTypes from 'prop-types';

const IntegerInput = ({ transformValue = toIntValue, ...props }) => {
    return <TextInput transformValue={transformValue} {...props} />;
};

IntegerInput.propTypes = {
    label: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    errorMessage: PropTypes.string,
    value: PropTypes.object,
    onChange: PropTypes.func,
    adornment: PropTypes.object,
    transformValue: PropTypes.func,
    acceptValue: PropTypes.func,
    formProps: PropTypes.object,
    previousValue: PropTypes.object,
    clearable: PropTypes.bool,
};

export default IntegerInput;
