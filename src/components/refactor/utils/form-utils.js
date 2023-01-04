/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Controller } from 'react-hook-form';

export const formControlledItem = (item, name, control) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) =>
                addPropsToReactElement(item, {
                    onChange,
                    value,
                    errorMsg: error?.message,
                })
            }
        />
    );
};

const addPropsToReactElement = (element, props) => {
    if (React.isValidElement(element)) {
        return React.cloneElement(element, props);
    }
    return element;
};
