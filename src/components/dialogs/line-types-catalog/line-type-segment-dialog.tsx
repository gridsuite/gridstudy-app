/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { ModificationDialog } from '../commons/modificationDialog';
import { useForm } from 'react-hook-form';
import { LineTypeSegmentForm } from './line-type-segment-form';
import { CustomFormProvider } from '@gridsuite/commons-ui';
import { ComputedLineCharacteristics } from './line-catalog.type';
import { emptyLineSegment, SegmentSchema } from './segment-utils';
import {
    AERIAL_AREA,
    AERIAL_TEMPERATURE,
    FINAL_CURRENT_LIMITS,
    SEGMENTS,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
    UNDERGROUND_AREA,
    UNDERGROUND_SHAPE_FACTOR,
} from '../../utils/field-constants';

const LineTypeSegmentSchema = yup
    .object()
    .shape({
        [AERIAL_AREA]: yup.object(),
        [AERIAL_TEMPERATURE]: yup.object(),
        [UNDERGROUND_AREA]: yup.object(),
        [UNDERGROUND_SHAPE_FACTOR]: yup.object(),
        [TOTAL_RESISTANCE]: yup.number().required(),
        [TOTAL_REACTANCE]: yup.number().required(),
        [TOTAL_SUSCEPTANCE]: yup.number().required(),
        [FINAL_CURRENT_LIMITS]: yup.array(),
        [SEGMENTS]: yup.array().of(SegmentSchema).required().min(1, 'AtLeastOneSegmentNeeded'),
    })
    .required();

export type LineTypeSegmentFormData = yup.InferType<typeof LineTypeSegmentSchema>;

const emptyFormData: LineTypeSegmentFormData = {
    [AERIAL_AREA]: { id: '', label: '' },
    [AERIAL_TEMPERATURE]: { id: '', label: '' },
    [UNDERGROUND_AREA]: { id: '', label: '' },
    [UNDERGROUND_SHAPE_FACTOR]: { id: '', label: '' },
    [TOTAL_RESISTANCE]: 0.0,
    [TOTAL_REACTANCE]: 0.0,
    [TOTAL_SUSCEPTANCE]: 0.0,
    [FINAL_CURRENT_LIMITS]: [],
    [SEGMENTS]: [emptyLineSegment],
};

export interface LineTypeSegmentDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: ComputedLineCharacteristics) => void;
}

const LineTypeSegmentDialog: FunctionComponent<LineTypeSegmentDialogProps> = ({ open, onSave, onClose }) => {
    const formMethods = useForm<LineTypeSegmentFormData>({
        defaultValues: emptyFormData,
        resolver: yupResolver<LineTypeSegmentFormData>(LineTypeSegmentSchema),
    });

    const { reset } = formMethods;

    const handleClear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    /**
     * RENDER
     */
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
};

export default LineTypeSegmentDialog;
