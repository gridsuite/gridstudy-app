/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../../../utils/yup-config';
import { RATIO_TAP_CHANGER_STATUS, PHASE_TAP_CHANGER_STATUS } from '../../../../../utils/field-constants';
import { ToBeEstimatedInfo } from './to-be-estimated.type';

export function getToBeEstimatedEmptyFormData(id: string) {
    return {
        [id]: {
            [RATIO_TAP_CHANGER_STATUS]: null,
            [PHASE_TAP_CHANGER_STATUS]: null,
        },
    };
}

export function getToBeEstimatedValidationSchema(id: string) {
    return {
        [id]: yup.object().shape({
            [RATIO_TAP_CHANGER_STATUS]: yup.boolean().nullable(),
            [PHASE_TAP_CHANGER_STATUS]: yup.boolean().nullable(),
        }),
    };
}

export function getToBeEstimatedEditData(id: string, toBeEstimated: ToBeEstimatedInfo) {
    return {
        [id]: {
            [RATIO_TAP_CHANGER_STATUS]: toBeEstimated?.ratioTapChangerStatus ?? null,
            [PHASE_TAP_CHANGER_STATUS]: toBeEstimated?.phaseTapChangerStatus ?? null,
        },
    };
}
