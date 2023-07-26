/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EventPropertyDefinition, PrimitiveTypes } from '../types/event.type';
import React from 'react';
import FloatInput from '../../../../utils/rhf-inputs/float-input';
import SelectInput from '../../../../utils/rhf-inputs/select-input';

const renderFloatField = (
    propertyName: string,
    propertyDefinition: EventPropertyDefinition | undefined,
    propertyValue: any
) => (
    <FloatInput
        name={propertyName}
        label={propertyDefinition ? propertyDefinition.labelId : ''}
        previousValue={propertyValue}
        clearable={true}
    />
);

const renderEnumField = (
    propertyName: string,
    propertyDefinition: EventPropertyDefinition | undefined,
    propertyValue: any
) => (
    <SelectInput
        name={propertyName}
        label={propertyDefinition ? propertyDefinition.labelId : ''}
        previousValue={propertyValue}
        options={propertyDefinition ? propertyDefinition.values ?? [] : []}
    />
);

const DEFAULT_PRIMITIVE_RENDER = {
    [PrimitiveTypes.ENUM]: renderEnumField,
    [PrimitiveTypes.BOOL]: undefined,
    [PrimitiveTypes.INTEGER]: undefined,
    [PrimitiveTypes.FLOAT]: renderFloatField,
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
