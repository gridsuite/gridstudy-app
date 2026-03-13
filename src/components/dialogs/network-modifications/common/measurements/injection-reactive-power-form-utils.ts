/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    getPowerWithValidityEditData,
    getPowerWithValidityEmptyFormData,
    getPowerWithValidityValidationSchema,
} from './power-with-validity-utils';
import { MEASUREMENT_Q } from '../../../../utils/field-constants';
import yup from '../../../../utils/yup-config';

export function getInjectionReactivePowerEmptyFormDataProperties() {
    return {
        ...getPowerWithValidityEmptyFormData(MEASUREMENT_Q),
    };
}
export function getInjectionReactivePowerEmptyFormData(id: string) {
    return {
        [id]: {
            ...getInjectionReactivePowerEmptyFormDataProperties(),
        },
    };
}

export const getInjectionReactivePowerValidationSchemaProperties = () =>
    yup.object().shape({
        ...getPowerWithValidityValidationSchema(MEASUREMENT_Q),
    });

export function getInjectionReactivePowerEditDataProperties(injectionData: any) {
    return {
        ...getPowerWithValidityEditData(MEASUREMENT_Q, {
            value: injectionData?.qMeasurementValue?.value,
            validity: injectionData?.qMeasurementValidity?.value,
        }),
    };
}
export function getInjectionReactivePowerEditData(id: string, injectionData: any) {
    return {
        [id]: {
            ...getInjectionReactivePowerEditDataProperties(injectionData),
        },
    };
}
