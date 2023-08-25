/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as yup from 'yup';
import { TextInput as RHFTextInput } from '@gridsuite/commons-ui';
import WrapperInput from './wrapper-input';

const TextInput = ({ value, label, callback }) => {
    const validator = yup.string();
    return (
        <WrapperInput
            value={value}
            label={label}
            callback={callback}
            validator={validator}
        >
            <RHFTextInput name={'value'} label={''} />
        </WrapperInput>
    );
};

export default TextInput;
