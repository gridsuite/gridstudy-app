/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EventPropertyDefinition, PrimitiveTypes } from '../types/event.type';
import { FloatInput, SelectInput } from '@gridsuite/commons-ui';

const renderFloatField = (
    propertyName: string,
    propertyDefinition: EventPropertyDefinition | undefined,
    propertyValue: any
) => (
    <FloatInput
        name={propertyName}
        label={propertyDefinition ? propertyDefinition.label : ''}
        clearable
        adornment={
            propertyDefinition?.unit
                ? {
                      position: 'end',
                      text: propertyDefinition.unit,
                  }
                : undefined
        }
        previousValue={parseFloat(propertyValue)}
    />
);

const renderEnumField = (
    propertyName: string,
    propertyDefinition: EventPropertyDefinition | undefined,
    propertyValue: any
) => (
    <SelectInput
        name={propertyName}
        options={propertyDefinition ? propertyDefinition.values ?? [] : []}
        label={propertyDefinition ? propertyDefinition.label : ''}
        size={'small'}
        previousValue={propertyValue}
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
    const render = propertyDefinition ? DEFAULT_PRIMITIVE_RENDER[propertyDefinition?.type] : undefined;
    return render && render(propertyName, propertyDefinition, propertyValue);
};
