/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_ID, EQUIPMENT_NAME, TAB_HEADER } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';

const headerValidationSchema = (id) => ({
    [id]: yup.object().shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
    }),
});

export const getHeaderValidationSchema = (id = TAB_HEADER) => {
    return headerValidationSchema(id);
};

const headerEmptyFormData = (id) => ({
    [id]: {
        [EQUIPMENT_ID]: '',
        [EQUIPMENT_NAME]: '',
    },
});

export const getHeaderEmptyFormData = (id = TAB_HEADER) => {
    return headerEmptyFormData(id);
};

export const getHeaderFormData = ({ equipmentId, equipmentName = '' }, id = TAB_HEADER) => ({
    [id]: {
        [EQUIPMENT_ID]: equipmentId,
        [EQUIPMENT_NAME]: equipmentName,
    },
});

export const LineCreationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    LIMITS_TAB: 1,
};
