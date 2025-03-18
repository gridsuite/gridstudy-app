/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DROOP, FREQUENCY_REGULATION } from '../../utils/field-constants';
import yup from '../../utils/yup-config';

export const getActivePowerControlEmptyFormData = (isEquipmentModification = false) => ({
    [FREQUENCY_REGULATION]: isEquipmentModification ? null : false,
    [DROOP]: null,
});

export const getActivePowerControlSchema = (isEquipmentModification = false) => ({
    [FREQUENCY_REGULATION]: yup
        .bool()
        .nullable()
        .when([], {
            is: () => !isEquipmentModification,
            then: (schema) => schema.required(),
        }),
    [DROOP]: yup
        .number()
        .nullable()
        .when([FREQUENCY_REGULATION], {
            is: (frequencyRegulation: boolean) => !isEquipmentModification && frequencyRegulation,
            then: (schema) => schema.required(),
        }),
});
