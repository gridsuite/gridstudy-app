/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EventPropertyDefinition, PrimitiveTypes } from '../types/event.type';
import React from 'react';
import FloatInput from '../../../../utils/rhf-inputs/float-input';

const makeRenderFloatField =
    () =>
    (
        propertyName: string,
        propertyDefinition: EventPropertyDefinition | undefined,
        propertyValue: any
    ) =>
        (
            <FloatInput
                name={propertyName}
                label={propertyDefinition ? propertyDefinition.labelId : ''}
                previousValue={propertyValue}
                clearable={true}
            />
        );

const DEFAULT_PRIMITIVE_RENDER = {
    [PrimitiveTypes.ENUM]: undefined,
    [PrimitiveTypes.BOOL]: undefined,
    [PrimitiveTypes.INTEGER]: undefined,
    [PrimitiveTypes.FLOAT]: makeRenderFloatField(),
    [PrimitiveTypes.STRING]: undefined,
};

export const makeComponentFor = (
    propertyName: string,
    propertyDefinition: EventPropertyDefinition | undefined,
    propertyValue: any
) => {
    const render = propertyDefinition
        ? DEFAULT_PRIMITIVE_RENDER[propertyDefinition?.type]
        : undefined;
    return render && render(propertyName, propertyDefinition, propertyValue);
};
