/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import TextInput from './text-input';

const integerValidator = {
    isValid: (value) => {
        return /^\d+$/.test(value);
    },
    errorMessage: 'value must be an integer',
};

const IntegerInput = ({ value, label, callback }) => {
    return (
        <TextInput
            value={value}
            label={label}
            callback={callback}
            validator={integerValidator}
        />
    );
};

export default IntegerInput;
