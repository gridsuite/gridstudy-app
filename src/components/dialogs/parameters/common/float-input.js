/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput as RHFFloatInput } from '@gridsuite/commons-ui';
import WrapperInput from './wrapper-input';

const FloatInput = ({ value, label, callback, validator }) => {
    return (
        <WrapperInput
            value={value}
            label={label}
            callback={callback}
            validator={validator}
        >
            <RHFFloatInput name={'value'} label={''} />
        </WrapperInput>
    );
};

export default FloatInput;
