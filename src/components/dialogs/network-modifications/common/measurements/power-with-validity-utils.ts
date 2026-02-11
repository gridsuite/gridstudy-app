/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../../utils/yup-config';
import { VALIDITY } from '../../../../utils/field-constants';
import { MeasurementInfo } from './measurement.type';
import { FieldConstants } from '@gridsuite/commons-ui';

export function getPowerWithValidityEmptyFormData(id: string) {
    return {
        [id]: {
            [FieldConstants.VALUE]: null,
            [VALIDITY]: null,
        },
    };
}

export function getPowerWithValidityValidationSchema(id: string) {
    return {
        [id]: yup.object().shape({
            [FieldConstants.VALUE]: yup.number().nullable(),
            [VALIDITY]: yup.boolean().nullable(),
        }),
    };
}

export function getPowerWithValidityEditData(id: string, measurement: MeasurementInfo) {
    return {
        [id]: {
            [FieldConstants.VALUE]: measurement?.value ?? null,
            [VALIDITY]: measurement?.validity ?? null,
        },
    };
}
