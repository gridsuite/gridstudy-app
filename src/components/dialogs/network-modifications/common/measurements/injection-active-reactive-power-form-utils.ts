/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MEASUREMENT_P, MEASUREMENT_Q } from 'components/utils/field-constants';
import {
    getPowerWithValidityEditData,
    getPowerWithValidityEmptyFormData,
    getPowerWithValidityValidationSchema,
} from './power-with-validity-utils';
import yup from '../../../../utils/yup-config';

export function getInjectionActiveReactivePowerEmptyFormDataProperties() {
    return {
        ...getPowerWithValidityEmptyFormData(MEASUREMENT_P),
        ...getPowerWithValidityEmptyFormData(MEASUREMENT_Q),
    };
}
export function getInjectionActiveReactivePowerEmptyFormData(id: string) {
    return {
        [id]: {
            ...getInjectionActiveReactivePowerEmptyFormDataProperties(),
        },
    };
}

export const getInjectionActiveReactivePowerValidationSchemaProperties = () =>
    yup.object().shape({
        ...getPowerWithValidityValidationSchema(MEASUREMENT_P),
        ...getPowerWithValidityValidationSchema(MEASUREMENT_Q),
    });

export const getInjectionActiveReactivePowerValidationSchema = (id: string) => ({
    [id]: getInjectionActiveReactivePowerValidationSchemaProperties(),
});

export function getInjectionActiveReactivePowerEditDataProperties(injectionData: any) {
    return {
        ...getPowerWithValidityEditData(MEASUREMENT_P, {
            value: injectionData?.pMeasurementValue?.value,
            validity: injectionData?.pMeasurementValidity?.value,
        }),
        ...getPowerWithValidityEditData(MEASUREMENT_Q, {
            value: injectionData?.qMeasurementValue?.value,
            validity: injectionData?.qMeasurementValidity?.value,
        }),
    };
}
export function getInjectionActiveReactivePowerEditData(id: string, injectionData: any) {
    return {
        [id]: {
            ...getInjectionActiveReactivePowerEditDataProperties(injectionData),
        },
    };
}
