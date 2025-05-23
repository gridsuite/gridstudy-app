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
import * as yup from 'yup';
import type { IntlShape } from 'react-intl';

export const getSetPointsEmptyFormData = (isEquipmentModification = false) => ({
    [ACTIVE_POWER_SET_POINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
});

export function getSetPointsSchema(intl: IntlShape, isEquipmentModification = false) {
    return {
        ...getActivePowerSetPointSchema(intl, isEquipmentModification),
        ...getReactivePowerSetPointSchema(isEquipmentModification),
    };
}

const getReactivePowerSetPointSchema = (isEquipmentModification = false) => ({
    [REACTIVE_POWER_SET_POINT]: yup
        .number()
        .nullable()
        .when([VOLTAGE_REGULATION], {
            is: (value: string) => !isEquipmentModification && !value,
            then: (schema) => schema.required(),
        }),
});

function getActivePowerSetPointSchema(intl: IntlShape, isEquipmentModification = false) {
    return {
        [ACTIVE_POWER_SET_POINT]: yup
            .number()
            .when([], {
                is: () => isEquipmentModification,
                then: (schema) => schema.nullable(),
            })
            .when([], {
                is: () => !isEquipmentModification,
                then: (schema) =>
                    schema
                        .required()
                        .nonNullable(intl.formatMessage({ id: 'FieldIsRequired' }))
                        .test(
                            'activePowerSetPoint',
                            intl.formatMessage({ id: 'ActivePowerMustBeZeroOrBetweenMinAndMaxActivePower' }),
                            (value, context) => {
                                if (value === 0) {
                                    return true;
                                }
                                const minActivePower = context.parent[MINIMUM_ACTIVE_POWER];
                                const maxActivePower = context.parent[MAXIMUM_ACTIVE_POWER];
                                if (minActivePower === null || maxActivePower === null) {
                                    return false;
                                }
                                return value >= minActivePower && value <= maxActivePower;
                            }
                        ),
            }),
    };
}
