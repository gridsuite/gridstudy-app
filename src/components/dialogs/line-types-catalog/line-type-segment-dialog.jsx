/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import {
    SEGMENT_DISTANCE_VALUE,
    SEGMENT_REACTANCE,
    SEGMENT_RESISTANCE,
    SEGMENT_SUSCEPTANCE,
    SEGMENT_TYPE_ID,
    SEGMENT_TYPE_VALUE,
    SEGMENTS,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
} from '../../utils/field-constants';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LineTypeSegmentForm } from './line-type-segment-form';
import { CustomFormProvider } from '@gridsuite/commons-ui';
import { emptyLineSegment } from './line-type-segment-utils';

const emptyFormData = {
    [TOTAL_RESISTANCE]: 0,
    [TOTAL_REACTANCE]: 0,
    [TOTAL_SUSCEPTANCE]: 0,
    [SEGMENTS]: [emptyLineSegment],
};

const formSchema = yup.object().shape({
    [TOTAL_RESISTANCE]: yup.number().required(),
    [TOTAL_REACTANCE]: yup.number().required(),
    [TOTAL_SUSCEPTANCE]: yup.number().required(),
    [SEGMENTS]: yup
        .array()
        .of(
            yup.object().shape({
                [SEGMENT_DISTANCE_VALUE]: yup
                    .number()
                    .required('SegmentDistanceMustBeGreaterThanZero')
                    .moreThan(0, 'SegmentDistanceMustBeGreaterThanZero'),
                [SEGMENT_TYPE_VALUE]: yup
                    .string()
                    .test('empty-check', 'SegmentTypeMissing', (value) => value.length > 0),
                [SEGMENT_TYPE_ID]: yup.string(),
                [SEGMENT_RESISTANCE]: yup.number(),
                [SEGMENT_REACTANCE]: yup.number(),
                [SEGMENT_SUSCEPTANCE]: yup.number(),
            })
        )
        .min(1, 'AtLeastOneSegmentNeeded'),
});

const LineTypeSegmentDialog = ({ ...dialogProps }) => {
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    const handleClear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    /**
     * RENDER
     */
    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="lg"
                onClear={handleClear}
                aria-labelledby="dialog-lineTypes-catalog"
                titleId="LineTypesCatalogDialogTitle"
                {...dialogProps}
            >
                <LineTypeSegmentForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

LineTypeSegmentDialog.propTypes = {};

export default LineTypeSegmentDialog;
