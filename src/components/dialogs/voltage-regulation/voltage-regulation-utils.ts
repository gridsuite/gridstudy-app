/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MAXIMUM_ACTIVE_POWER, MINIMUM_ACTIVE_POWER, VOLTAGE_REGULATION } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';

export const getReactivePowerSetPointSchema = (isEquipmentModification = false) =>
    yup
        .number()
        .nullable()
        .when([VOLTAGE_REGULATION], {
            is: (value: number) => !isEquipmentModification && !value,
            then: (schema) => schema.required(),
        });

export const getActivePowerSetPointSchema = (isEquipmentModification = false) =>
    yup
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
        });
