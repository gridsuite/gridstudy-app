/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ACTIVE_POWER_SET_POINT,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_REGULATION,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';

export const getSetPointsEmptyFormData = (isEquipmentModification = false) => ({
    [ACTIVE_POWER_SET_POINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
});

export const getSetPointsSchema = (isEquipmentModification = false) => ({
    ...getActivePowerSetPointSchema(isEquipmentModification),
    ...getReactivePowerSetPointSchema(isEquipmentModification),
});

const getReactivePowerSetPointSchema = (isEquipmentModification: boolean) => ({
    [REACTIVE_POWER_SET_POINT]: yup
        .number()
        .nullable()
        .when([VOLTAGE_REGULATION], {
            is: (value: string) => !isEquipmentModification && !value,
            then: (schema) => schema.required(),
        }),
});

export const getActivePowerSetPointSchema = (isEquipmentModification: boolean) => ({
    [ACTIVE_POWER_SET_POINT]: yup
        .number()
        .when([], {
            is: () => isEquipmentModification,
            then: (schema) => {
                return schema.nullable();
            },
        })
        .when([], {
            is: () => !isEquipmentModification,
            then: (schema) => {
                return schema
                    .required()
                    .nonNullable('FieldIsRequired')
                    .test(
                        'activePowerSetPoint',
                        'ActivePowerMustBeZeroOrBetweenMinAndMaxActivePower',
                        (value, context) => {
                            const minActivePower = context.parent[MINIMUM_ACTIVE_POWER];
                            const maxActivePower = context.parent[MAXIMUM_ACTIVE_POWER];
                            if (value === 0) {
                                return true;
                            }
                            if (minActivePower === null || maxActivePower === null) {
                                return false;
                            }
                            return value >= minActivePower && value <= maxActivePower;
                        }
                    );
            },
        }),
});
