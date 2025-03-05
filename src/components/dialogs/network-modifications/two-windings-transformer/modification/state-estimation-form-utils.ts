/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    MEASUREMENT_P1,
    MEASUREMENT_Q1,
    MEASUREMENT_P2,
    MEASUREMENT_Q2,
    TO_BE_ESTIMATED,
} from 'components/utils/field-constants';
import {
    getPowerWithValidityEditData,
    getPowerWithValidityEmptyFormData,
    getPowerWithValidityValidationSchema,
} from '../../common/measurements/power-with-validity-utils';
import yup from '../../../../utils/yup-config';
import {
    getToBeEstimatedEditData,
    getToBeEstimatedEmptyFormData,
    getToBeEstimatedValidationSchema,
} from './to-be-estimated-form-utils';

export function getStateEstimationEmptyFormData(id: string) {
    return {
        [id]: {
            ...getPowerWithValidityEmptyFormData(MEASUREMENT_P1),
            ...getPowerWithValidityEmptyFormData(MEASUREMENT_Q1),
            ...getPowerWithValidityEmptyFormData(MEASUREMENT_P2),
            ...getPowerWithValidityEmptyFormData(MEASUREMENT_Q2),
            ...getToBeEstimatedEmptyFormData(TO_BE_ESTIMATED),
        },
    };
}

export const getStateEstimationValidationSchema = (id: string) => ({
    [id]: yup.object().shape({
        ...getPowerWithValidityValidationSchema(MEASUREMENT_P1),
        ...getPowerWithValidityValidationSchema(MEASUREMENT_Q1),
        ...getPowerWithValidityValidationSchema(MEASUREMENT_P2),
        ...getPowerWithValidityValidationSchema(MEASUREMENT_Q2),
        ...getToBeEstimatedValidationSchema(TO_BE_ESTIMATED),
    }),
});

export function getStateEstimationEditData(id: string, branchData: any) {
    return {
        [id]: {
            ...getPowerWithValidityEditData(MEASUREMENT_P1, {
                value: branchData?.p1MeasurementValue?.value,
                validity: branchData?.p1MeasurementValidity?.value,
            }),
            ...getPowerWithValidityEditData(MEASUREMENT_Q1, {
                value: branchData?.q1MeasurementValue?.value,
                validity: branchData?.q1MeasurementValidity?.value,
            }),
            ...getPowerWithValidityEditData(MEASUREMENT_P2, {
                value: branchData?.p2MeasurementValue?.value,
                validity: branchData?.p2MeasurementValidity?.value,
            }),
            ...getPowerWithValidityEditData(MEASUREMENT_Q2, {
                value: branchData?.q2MeasurementValue?.value,
                validity: branchData?.q2MeasurementValidity?.value,
            }),
            ...getToBeEstimatedEditData(TO_BE_ESTIMATED, {
                ratioTapChangerStatus: branchData?.ratioTapChangerToBeEstimated?.value,
                phaseTapChangerStatus: branchData?.phaseTapChangerToBeEstimated?.value,
            }),
        },
    };
}
