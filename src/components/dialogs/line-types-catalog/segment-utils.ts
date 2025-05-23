/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    SEGMENT_DISTANCE_VALUE,
    SEGMENT_REACTANCE,
    SEGMENT_RESISTANCE,
    SEGMENT_SUSCEPTANCE,
    SEGMENT_TYPE_ID,
    SEGMENT_TYPE_VALUE,
} from 'components/utils/field-constants';
import * as yup from 'yup';
import type { InferType } from 'yup';
import type { IntlShape } from 'react-intl';

export function getSegmentSchema(intl: IntlShape) {
    return yup.object().shape({
        [SEGMENT_DISTANCE_VALUE]: yup
            .number()
            .required(intl.formatMessage({ id: 'SegmentDistanceMustBeGreaterThanZero' }))
            .moreThan(0, intl.formatMessage({ id: 'SegmentDistanceMustBeGreaterThanZero' })),
        [SEGMENT_TYPE_VALUE]: yup
            .string()
            .required()
            .test('empty-check', intl.formatMessage({ id: 'SegmentTypeMissing' }), (value) =>
                value ? value.length > 0 : false
            ),
        [SEGMENT_TYPE_ID]: yup.string().required(),
        [SEGMENT_RESISTANCE]: yup.number().required(),
        [SEGMENT_REACTANCE]: yup.number().required(),
        [SEGMENT_SUSCEPTANCE]: yup.number().required(),
    });
}

export type SegmentFormData = InferType<ReturnType<typeof getSegmentSchema>>;

export const emptyLineSegment: SegmentFormData = {
    [SEGMENT_DISTANCE_VALUE]: 0.0,
    [SEGMENT_TYPE_VALUE]: '',
    [SEGMENT_TYPE_ID]: '',
    [SEGMENT_RESISTANCE]: 0.0,
    [SEGMENT_REACTANCE]: 0.0,
    [SEGMENT_SUSCEPTANCE]: 0.0,
};
