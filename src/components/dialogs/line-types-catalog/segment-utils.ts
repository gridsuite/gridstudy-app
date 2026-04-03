/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    AREA,
    LIMIT_SET_NAME,
    LIMIT_VALUE,
    PERMANENT_LIMIT,
    SEGMENT_CURRENT_LIMITS,
    SEGMENT_DISTANCE_VALUE,
    SEGMENT_REACTANCE,
    SEGMENT_RESISTANCE,
    SEGMENT_SUSCEPTANCE,
    SEGMENT_TYPE_ID,
    SEGMENT_TYPE_VALUE,
    SHAPE_FACTOR,
    TEMPERATURE,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMITS,
} from 'components/utils/field-constants';
import yup from '../../utils/yup-config';
import { InferType } from 'yup';

export const SegmentTemporaryLimitSchema = yup.object().shape({
    [LIMIT_VALUE]: yup.number().required(),
    [TEMPORARY_LIMIT_DURATION]: yup.number().required(),
    [TEMPORARY_LIMIT_NAME]: yup.string().required(),
});

export const SegmentCurrentLimitsSchema = yup.object().shape({
    [LIMIT_SET_NAME]: yup.string().required(),
    [PERMANENT_LIMIT]: yup.number().required(),
    [TEMPORARY_LIMITS]: yup.array().of(SegmentTemporaryLimitSchema).nullable(),
});

export const SegmentSchema = yup.object().shape({
    [SEGMENT_DISTANCE_VALUE]: yup
        .number()
        .required('SegmentDistanceMustBeGreaterThanZero')
        .moreThan(0, 'SegmentDistanceMustBeGreaterThanZero'),
    [SEGMENT_TYPE_VALUE]: yup
        .string()
        .required()
        .test('empty-check', 'SegmentTypeMissing', (value) => (value ? value.length > 0 : false)),
    [SEGMENT_TYPE_ID]: yup.string().required(),
    [AREA]: yup.string().nullable().default(null),
    [TEMPERATURE]: yup.string().nullable().default(null),
    [SHAPE_FACTOR]: yup.number().nullable().default(null),
    [SEGMENT_RESISTANCE]: yup.number().required(),
    [SEGMENT_REACTANCE]: yup.number().required(),
    [SEGMENT_SUSCEPTANCE]: yup.number().required(),
    [SEGMENT_CURRENT_LIMITS]: yup.array().of(SegmentCurrentLimitsSchema),
});

export type SegmentFormData = InferType<typeof SegmentSchema>;
export type SegmentTemporaryLimitFormData = InferType<typeof SegmentTemporaryLimitSchema>;
export type SegmentCurrentLimitsFormData = InferType<typeof SegmentCurrentLimitsSchema>;

export const emptyLineSegment: SegmentFormData = {
    [SEGMENT_DISTANCE_VALUE]: 0.0,
    [SEGMENT_TYPE_VALUE]: '',
    [SEGMENT_TYPE_ID]: '',
    [SEGMENT_RESISTANCE]: 0.0,
    [SEGMENT_REACTANCE]: 0.0,
    [SEGMENT_SUSCEPTANCE]: 0.0,
    [SEGMENT_CURRENT_LIMITS]: [],
    [AREA]: null,
    [TEMPERATURE]: null,
    [SHAPE_FACTOR]: null,
};
