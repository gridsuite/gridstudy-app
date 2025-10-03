/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TRANSFORMER_REACTANCE, TRANSIENT_REACTANCE } from '../../utils/field-constants';
import yup from '../../utils/yup-config';

export const getShortCircuitEmptyFormData = () => {
    return {
        [TRANSIENT_REACTANCE]: null,
        [TRANSFORMER_REACTANCE]: null,
    };
};

export const getShortCircuitFormSchema = (isEquipmentModification = false) => {
    return {
        [TRANSFORMER_REACTANCE]: yup.number().nullable(),
        [TRANSIENT_REACTANCE]: isEquipmentModification
            ? yup.number().nullable()
            : yup
                  .number()
                  .nullable()
                  .when([TRANSFORMER_REACTANCE], {
                      is: (transformerReactance: number) => transformerReactance != null,
                      then: (schema) => schema.required(),
                  }),
    };
};

export const getShortCircuitFormData = ({
    directTransX,
    stepUpTransformerX,
}: {
    directTransX?: number | null;
    stepUpTransformerX?: number | null;
}) => {
    return {
        [TRANSIENT_REACTANCE]: directTransX,
        [TRANSFORMER_REACTANCE]: stepUpTransformerX,
    };
};

export interface ShortCircuitFormInfos {
    directTransX?: number | null;
    stepUpTransformerX?: number | null;
}
