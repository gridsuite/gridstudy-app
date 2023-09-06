/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
} from 'components/utils/field-constants';
import {
    getReactiveCapabilityCurveEmptyFormData,
    getReactiveCapabilityCurveValidationSchema,
    getRowEmptyFormData,
} from './reactive-capability-curve/reactive-capability-utils';
import yup from 'components/utils/yup-config';
import { REACTIVE_LIMITS } from '../../utils/field-constants';

export const getReactiveLimitsFormData = ({
    id = REACTIVE_LIMITS,
    reactiveCapabilityCurveChoice = 'CURVE',
    minimumReactivePower = null,
    maximumReactivePower = null,
    reactiveCapabilityCurveTable = [
        getRowEmptyFormData(),
        getRowEmptyFormData(),
    ],
}) => ({
    [id]: {
        [REACTIVE_CAPABILITY_CURVE_CHOICE]: reactiveCapabilityCurveChoice,
        [MINIMUM_REACTIVE_POWER]: minimumReactivePower,
        [MAXIMUM_REACTIVE_POWER]: maximumReactivePower,
        [REACTIVE_CAPABILITY_CURVE_TABLE]: reactiveCapabilityCurveTable,
    },
});
export const getReactiveLimitsEmptyFormData = (id = REACTIVE_LIMITS) =>
    getReactiveLimitsFormData({ id });

export const getReactiveLimitsSchema = ({
    id = REACTIVE_LIMITS,
    isEquipmentModification = false,
}) => ({
    [id]: yup.object().shape({
        [REACTIVE_CAPABILITY_CURVE_CHOICE]: yup.string().nullable().required(),
        [MINIMUM_REACTIVE_POWER]: yup
            .number()
            .nullable()
            .when([MAXIMUM_REACTIVE_POWER], {
                is: (maximumReactivePower) =>
                    !isEquipmentModification && maximumReactivePower != null,
                then: (schema) => schema.required(),
            }),
        [MAXIMUM_REACTIVE_POWER]: yup
            .number()
            .nullable()
            .when([MINIMUM_REACTIVE_POWER], {
                is: (minimumReactivePower) =>
                    !isEquipmentModification && minimumReactivePower != null,
                then: (schema) => schema.required(),
            }),
        ...getReactiveCapabilityCurveValidationSchema(
            REACTIVE_CAPABILITY_CURVE_TABLE,
            isEquipmentModification
        ),
    }, [MAXIMUM_REACTIVE_POWER, MINIMUM_REACTIVE_POWER]),
});
