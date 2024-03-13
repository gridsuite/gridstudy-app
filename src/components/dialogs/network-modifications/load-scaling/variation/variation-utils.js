/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from 'components/utils/yup-config';
import {
    FILTERS,
    ID,
    NAME,
    REACTIVE_VARIATION_MODE,
    SPECIFIC_METADATA,
    TYPE,
    VARIATION_MODE,
    VARIATION_VALUE,
} from 'components/utils/field-constants';
import { REACTIVE_VARIATION_MODES } from 'components/network/constants';

export const IDENTIFIER_LIST = 'IDENTIFIER_LIST';
export const getVariationSchema = () =>
    yup
        .object()
        .nullable()
        .shape({
            [VARIATION_MODE]: yup.string().nullable().required(),
            [VARIATION_VALUE]: yup.number().nullable().required(),
            [REACTIVE_VARIATION_MODE]: yup.string().nullable().required(),
            [FILTERS]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                        [SPECIFIC_METADATA]: yup.object().shape({
                            [TYPE]: yup.string(),
                        }),
                    }),
                )
                .required()
                .min(1, 'FieldIsRequired'),
        });

export const getVariationsSchema = (id) => ({
    [id]: yup
        .array()
        .nullable()
        .min(1, 'EmptyList.variations')
        .of(getVariationSchema()),
});

export const getVariationEmptyForm = (variationMode) => {
    return {
        [VARIATION_MODE]: variationMode,
        [VARIATION_VALUE]: null,
        [REACTIVE_VARIATION_MODE]: REACTIVE_VARIATION_MODES.CONSTANT_Q.id,
        [FILTERS]: [],
    };
};
