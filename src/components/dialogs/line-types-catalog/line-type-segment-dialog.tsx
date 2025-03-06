/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback } from 'react';
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
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import { useForm } from 'react-hook-form';
import { LineTypeSegmentForm } from './line-type-segment-form';
import { CustomFormProvider } from '@gridsuite/commons-ui';
import { emptyLineSegment } from './line-type-segment-utils';
import { LineTypeInfo, LineTypeSegmentFormData } from "./line-catalog.type";

const emptyFormData: LineTypeSegmentFormData = {
    [TOTAL_RESISTANCE]: 0.0,
    [TOTAL_REACTANCE]: 0.0,
    [TOTAL_SUSCEPTANCE]: 0.0,
    [SEGMENTS]: [emptyLineSegment],
};

const formSchema = yup
    .object()
    .shape({
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
                        .required()
                        .test('empty-check', 'SegmentTypeMissing', (value) => (value ? value.length > 0 : false)),
                    [SEGMENT_TYPE_ID]: yup.string().required(),
                    [SEGMENT_RESISTANCE]: yup.number().required(),
                    [SEGMENT_REACTANCE]: yup.number().required(),
                    [SEGMENT_SUSCEPTANCE]: yup.number().required(),
                })
            )
            .required()
            .min(1, 'AtLeastOneSegmentNeeded'),
    })
    .required();

export interface LineTypeSegmentDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: LineTypeInfo) => void;
}

const LineTypeSegmentDialog: FunctionComponent<LineTypeSegmentDialogProps> = ({ open, onSave, onClose }) => {
    const formMethods = useForm<LineTypeSegmentFormData>({
        defaultValues: emptyFormData,
        resolver: yupResolver<LineTypeSegmentFormData>(formSchema),
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
                open={open}
                onClose={onClose}
                onSave={onSave}
            >
                <LineTypeSegmentForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LineTypeSegmentDialog;
