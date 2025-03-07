/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TO_BE_ESTIMATED } from 'components/utils/field-constants';
import yup from '../../../../utils/yup-config';
import {
    getBranchActiveReactivePowerEditDataProperties,
    getBranchActiveReactivePowerEmptyFormDataProperties,
    getBranchActiveReactivePowerValidationSchemaProperties,
} from '../../common/measurements/branch-active-reactive-power-form-utils';
import {
    getToBeEstimatedEditData,
    getToBeEstimatedEmptyFormData,
    getToBeEstimatedValidationSchema,
} from './2wt-to-be-estimated/to-be-estimated-form-utils';

// We have utils functions to combine the common branch part (measurements) with the 2wt-specific part (toBeEstimated)

export function getStateEstimationEmptyFormData(id: string) {
    return {
        [id]: {
            ...getBranchActiveReactivePowerEmptyFormDataProperties(),
            ...getToBeEstimatedEmptyFormData(TO_BE_ESTIMATED),
        },
    };
}

export const getStateEstimationValidationSchema = (id: string) => ({
    [id]: yup.object().shape({
        ...getBranchActiveReactivePowerValidationSchemaProperties(),
        ...getToBeEstimatedValidationSchema(TO_BE_ESTIMATED),
    }),
});

export function getStateEstimationEditData(id: string, branchData: any) {
    return {
        [id]: {
            ...getBranchActiveReactivePowerEditDataProperties(branchData),
            ...getToBeEstimatedEditData(TO_BE_ESTIMATED, {
                ratioTapChangerStatus: branchData?.ratioTapChangerToBeEstimated?.value,
                phaseTapChangerStatus: branchData?.phaseTapChangerToBeEstimated?.value,
            }),
        },
    };
}
