/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export const formControlledItem = (item, name) => {
    return <CustomController name={name} item={item} />;
};

const addPropsToReactElement = (element, props) => {
    if (React.isValidElement(element)) {
        return React.cloneElement(element, props);
    }
    return element;
};

const CustomController = ({ name, item }) => {
    const methods = useFormContext();
    const { isFieldRequired } = methods;

    return (
        <Controller
            name={name}
            render={({ field: { onChange, value }, fieldState: { error } }) =>
                addPropsToReactElement(item, {
                    onChange,
                    value,
                    errorMsg: error?.message,
                    isRequired: isFieldRequired(name),
                })
            }
        />
    );
};
