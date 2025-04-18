/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MEASUREMENT_P1, MEASUREMENT_Q1, MEASUREMENT_P2, MEASUREMENT_Q2 } from 'components/utils/field-constants';
import {
    getPowerWithValidityEditData,
    getPowerWithValidityEmptyFormData,
    getPowerWithValidityValidationSchema,
} from './power-with-validity-utils';
import yup from '../../../../utils/yup-config';

export function getBranchActiveReactivePowerEmptyFormDataProperties() {
    return {
        ...getPowerWithValidityEmptyFormData(MEASUREMENT_P1),
        ...getPowerWithValidityEmptyFormData(MEASUREMENT_Q1),
        ...getPowerWithValidityEmptyFormData(MEASUREMENT_P2),
        ...getPowerWithValidityEmptyFormData(MEASUREMENT_Q2),
    };
}
export function getBranchActiveReactivePowerEmptyFormData(id: string) {
    return {
        [id]: {
            ...getBranchActiveReactivePowerEmptyFormDataProperties(),
        },
    };
}

export const getBranchActiveReactivePowerValidationSchemaProperties = () => ({
    ...getPowerWithValidityValidationSchema(MEASUREMENT_P1),
    ...getPowerWithValidityValidationSchema(MEASUREMENT_Q1),
    ...getPowerWithValidityValidationSchema(MEASUREMENT_P2),
    ...getPowerWithValidityValidationSchema(MEASUREMENT_Q2),
});
export const getBranchActiveReactivePowerValidationSchema = (id: string) => ({
    [id]: yup.object().shape({
        ...getBranchActiveReactivePowerValidationSchemaProperties(),
    }),
});

export function getBranchActiveReactivePowerEditDataProperties(branchData: any) {
    return {
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
    };
}
export function getBranchActiveReactivePowerEditData(id: string, branchData: any) {
    return {
        [id]: {
            ...getBranchActiveReactivePowerEditDataProperties(branchData),
        },
    };
}
