/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import TextInput from './text-input';

const doubleValidator = {
    isValid: (value) => {
        return /^-?\d+([.,]\d+)?$/.test(value);
    },
    errorMessage: 'value must be a double',
};

const DoubleInput = ({ value, label, callback }) => {
    return (
        <TextInput
            value={value}
            label={label}
            callback={callback}
            validator={doubleValidator}
        />
    );
};

export default DoubleInput;
