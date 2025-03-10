/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    MAX_Q,
    MAXIMUM_REACTIVE_POWER,
    MIN_Q,
    MINIMUM_REACTIVE_POWER,
    P,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
} from 'components/utils/field-constants';
import {
    getReactiveCapabilityCurveValidationSchema,
    getRowEmptyFormData,
} from './reactive-capability-curve/reactive-capability-utils';
import yup from 'components/utils/yup-config';
import { ReactiveCapabilityCurvePointsInfos } from '../../../services/network-modification-types';

export type ReactiveCapabilityCurveTable = {
    [P]?: number | null;
    [MAX_Q]?: number | null;
    [MIN_Q]?: number | null;
};

export interface MinMaxReactiveLimitsFormInfos {
    minQ?: number | null;
    maxQ?: number | null;
}

export const getReactiveLimitsFormInfos = ({
    id = REACTIVE_LIMITS,
    reactiveCapabilityCurveChoice = 'CURVE',
    minimumReactivePower,
    maximumReactivePower,
    reactiveCapabilityCurvePoints,
}: {
    id: string;
    reactiveCapabilityCurveChoice: string;
    minimumReactivePower?: number | null;
    maximumReactivePower?: number | null;
    reactiveCapabilityCurvePoints?: ReactiveCapabilityCurvePointsInfos[] | null;
}) => ({
    [id]: {
        [REACTIVE_CAPABILITY_CURVE_CHOICE]: reactiveCapabilityCurveChoice,
        [MINIMUM_REACTIVE_POWER]: minimumReactivePower ?? null,
        [MAXIMUM_REACTIVE_POWER]: maximumReactivePower ?? null,
        [REACTIVE_CAPABILITY_CURVE_TABLE]: reactiveCapabilityCurvePoints ?? [
            getRowEmptyFormData(),
            getRowEmptyFormData(),
        ],
    },
});

export const getReactiveLimitsFormData = ({
    id = REACTIVE_LIMITS,
    reactiveCapabilityCurveChoice = 'CURVE',
    minimumReactivePower,
    maximumReactivePower,
    reactiveCapabilityCurveTable,
}: {
    id: string;
    reactiveCapabilityCurveChoice: string;
    minimumReactivePower?: number | null;
    maximumReactivePower?: number | null;
    reactiveCapabilityCurveTable?: ReactiveCapabilityCurveTable[] | null;
}) => ({
    [id]: {
        [REACTIVE_CAPABILITY_CURVE_CHOICE]: reactiveCapabilityCurveChoice,
        [MINIMUM_REACTIVE_POWER]: minimumReactivePower ?? null,
        [MAXIMUM_REACTIVE_POWER]: maximumReactivePower ?? null,
        [REACTIVE_CAPABILITY_CURVE_TABLE]: reactiveCapabilityCurveTable ?? [
            getRowEmptyFormData(),
            getRowEmptyFormData(),
        ],
    },
});

export const getReactiveLimitsEmptyFormData = (id = REACTIVE_LIMITS) => ({
    [id]: {
        [REACTIVE_CAPABILITY_CURVE_CHOICE]: 'CURVE',
        [MINIMUM_REACTIVE_POWER]: null,
        [MAXIMUM_REACTIVE_POWER]: null,
        [REACTIVE_CAPABILITY_CURVE_TABLE]: [getRowEmptyFormData(), getRowEmptyFormData()],
    },
});

export const getReactiveLimitsSchema = (
    isEquipmentModification = false,
    positiveAndNegativePExist = false // if true, we check that Reactive Capability table has at least one row with negative P and one with positive P
) =>
    yup.object().shape({
        [REACTIVE_CAPABILITY_CURVE_CHOICE]: yup.string().nullable().required(),
        [MINIMUM_REACTIVE_POWER]: yup.number().nullable(),
        [MAXIMUM_REACTIVE_POWER]: yup.number().nullable(),

        // Custom validation to prevent cyclic dependency
        validateReactivePower: yup
            .mixed()
            .test(
                'reactive-power-check',
                'Both minimum and maximum reactive power are required if one is provided',
                function () {
                    const minPower = this.parent[MINIMUM_REACTIVE_POWER];
                    const maxPower = this.parent[MAXIMUM_REACTIVE_POWER];

                    if (!isEquipmentModification && (minPower != null || maxPower != null)) {
                        return minPower != null && maxPower != null;
                    }
                    return true;
                }
            ),
        [REACTIVE_CAPABILITY_CURVE_TABLE]: getReactiveCapabilityCurveValidationSchema(positiveAndNegativePExist),
    });
