/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_ID, EQUIPMENT_NAME, TAB_HEADER } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import { ObjectSchema } from 'yup';

const headerValidationSchema = <T extends string>(id: T) => {
    const headerSchema = yup.object().shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
    });
    return {
        [id]: headerSchema,
    } as Record<T, ObjectSchema<yup.InferType<typeof headerSchema>>>;
};
export const getHeaderValidationSchema = <T extends string = typeof TAB_HEADER>(id: T = TAB_HEADER as T) => {
    return headerValidationSchema(id);
};

const headerEmptyFormData = (id: string) => ({
    [id]: {
        [EQUIPMENT_ID]: '',
        [EQUIPMENT_NAME]: '',
    },
});

export const getHeaderEmptyFormData = (id = TAB_HEADER) => {
    return headerEmptyFormData(id);
};

export const getHeaderFormData = <T extends string = typeof TAB_HEADER>(
    { equipmentId, equipmentName = '' }: { equipmentId: string; equipmentName: string | null },
    id: T = TAB_HEADER as T
) => {
    const headerFormData = {
        [EQUIPMENT_ID]: equipmentId,
        [EQUIPMENT_NAME]: equipmentName,
    };
    return {
        [id]: headerFormData,
    } as Record<T, typeof headerFormData>;
};

export const LineCreationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    LIMITS_TAB: 1,
};
