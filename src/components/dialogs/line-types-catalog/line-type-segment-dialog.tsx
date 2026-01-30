/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { useForm } from 'react-hook-form';
import { LineTypeSegmentForm } from './line-type-segment-form';
import { CustomFormProvider, DeepNullable, ModificationDialog } from '@gridsuite/commons-ui';
import { ComputedLineCharacteristics } from './line-catalog.type';
import { SegmentSchema } from './segment-utils';
import {
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
        [FINAL_CURRENT_LIMITS]: yup.array(),
        [SEGMENTS]: yup.array().of(SegmentSchema).required().min(1, 'AtLeastOneSegmentNeeded'),
    })
    .required();

const emptyFormData = {
    [TOTAL_RESISTANCE]: 0.0,
    [TOTAL_REACTANCE]: 0.0,
    [TOTAL_SUSCEPTANCE]: 0.0,
    [FINAL_CURRENT_LIMITS]: [],
    [SEGMENTS]: [],
};

export interface LineTypeSegmentDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: ComputedLineCharacteristics) => void;
}

export type LineTypeSegmentDialogSchemaForm = InferType<typeof LineTypeSegmentSchema>;

export default function LineTypeSegmentDialog({ open, onSave, onClose }: Readonly<LineTypeSegmentDialogProps>) {
    const formMethods = useForm<DeepNullable<LineTypeSegmentDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LineTypeSegmentDialogSchemaForm>>(LineTypeSegmentSchema),
    });

    const { reset } = formMethods;

    const handleClear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <CustomFormProvider validationSchema={LineTypeSegmentSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'lg'}
                onClear={handleClear}
                titleId="LineTypesCatalogDialogTitle"
                open={open}
                onClose={onClose}
                onSave={onSave}
            >
                <LineTypeSegmentForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
