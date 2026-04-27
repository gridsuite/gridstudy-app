/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { ModificationDialog } from '../commons/modificationDialog';
import { useForm } from 'react-hook-form';
import { LineTypeSegmentForm } from './line-type-segment-form';
import { CustomFormProvider, DeepNullable } from '@gridsuite/commons-ui';
import { ComputedLineCharacteristics } from './line-catalog.type';
import { SegmentFormData, SegmentSchema } from './segment-utils';
import {
    APPLY_SEGMENTS_LIMITS,
    FINAL_CURRENT_LIMITS,
    SEGMENTS,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
} from '../../utils/field-constants';
import { InferType } from 'yup';

const LineTypeSegmentSchema = yup
    .object()
    .shape({
        [TOTAL_RESISTANCE]: yup.number().required(),
        [TOTAL_REACTANCE]: yup.number().required(),
        [TOTAL_SUSCEPTANCE]: yup.number().required(),
        [APPLY_SEGMENTS_LIMITS]: yup.boolean().required().default(true),
        [FINAL_CURRENT_LIMITS]: yup.array(),
        [SEGMENTS]: yup.array().of(SegmentSchema).required().min(1, 'AtLeastOneSegmentNeeded'),
    })
    .required();

const emptyFormData = {
    [TOTAL_RESISTANCE]: 0.0,
    [TOTAL_REACTANCE]: 0.0,
    [TOTAL_SUSCEPTANCE]: 0.0,
    [APPLY_SEGMENTS_LIMITS]: true,
    [FINAL_CURRENT_LIMITS]: [],
    [SEGMENTS]: [],
};

export interface LineTypeSegmentDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (
        data: ComputedLineCharacteristics,
        lineSegments: DeepNullable<SegmentFormData | null>[],
        applyLimits?: boolean | null
    ) => void;
    editData?: SegmentFormData[];
    applySegmentsLimits?: boolean;
    isModification?: boolean;
}

export type LineTypeSegmentDialogSchemaForm = InferType<typeof LineTypeSegmentSchema>;

export default function LineTypeSegmentDialog({
    open,
    onSave,
    onClose,
    editData,
    applySegmentsLimits = true,
    isModification = false,
}: Readonly<LineTypeSegmentDialogProps>) {
    const formMethods = useForm<DeepNullable<LineTypeSegmentDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LineTypeSegmentDialogSchemaForm>>(LineTypeSegmentSchema),
    });

    const { reset } = formMethods;
    const { getValues } = formMethods;
    const handleClear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (data: ComputedLineCharacteristics) => {
            onSave(data, getValues(`${SEGMENTS}`) ?? [], getValues(APPLY_SEGMENTS_LIMITS));
        },
        [getValues, onSave]
    );

    return (
        <CustomFormProvider validationSchema={LineTypeSegmentSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'lg'}
                onClear={handleClear}
                titleId="LineTypesCatalogDialogTitle"
                open={open}
                onClose={onClose}
                onSave={onSubmit}
            >
                <LineTypeSegmentForm
                    editData={editData}
                    isModification={isModification}
                    applySegmentsLimits={applySegmentsLimits}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
