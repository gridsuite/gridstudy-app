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
import { SegmentFormData, SegmentSchema } from './segment-utils';
import {
    AERIAL_AREAS,
    AERIAL_TEMPERATURES,
    FINAL_CURRENT_LIMITS,
    SEGMENTS,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
    UNDERGROUND_AREAS,
    UNDERGROUND_SHAPE_FACTORS,
} from '../../utils/field-constants';

const LineTypeSegmentSchema = yup
    .object()
    .shape({
        [AERIAL_AREAS]: yup.string().nullable().required(),
        [AERIAL_TEMPERATURES]: yup.string().nullable().required(),
        [UNDERGROUND_AREAS]: yup.string().nullable(),
        [UNDERGROUND_SHAPE_FACTORS]: yup.number().nullable(),
        [TOTAL_RESISTANCE]: yup.number().required(),
        [TOTAL_REACTANCE]: yup.number().required(),
        [TOTAL_SUSCEPTANCE]: yup.number().required(),
        [FINAL_CURRENT_LIMITS]: yup.array(),
        [SEGMENTS]: yup.array().of(SegmentSchema).required().min(1, 'AtLeastOneSegmentNeeded'),
    })
    .required();

export type LineTypeSegmentFormData = {
    [AERIAL_AREAS]: string;
    [AERIAL_TEMPERATURES]: string;
    [UNDERGROUND_AREAS]: string;
    [UNDERGROUND_SHAPE_FACTORS]: number;
    [TOTAL_RESISTANCE]: number;
    [TOTAL_REACTANCE]: number;
    [TOTAL_SUSCEPTANCE]: number;
    [FINAL_CURRENT_LIMITS]: [];
    [SEGMENTS]: SegmentFormData[];
};

const emptyFormData = {
    [AERIAL_AREAS]: null,
    [AERIAL_TEMPERATURES]: null,
    [UNDERGROUND_AREAS]: null,
    [UNDERGROUND_SHAPE_FACTORS]: null,
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

const LineTypeSegmentDialog: FunctionComponent<LineTypeSegmentDialogProps> = ({ open, onSave, onClose }) => {
    const formMethods = useForm<any>({
        defaultValues: emptyFormData,
        resolver: yupResolver<any>(LineTypeSegmentSchema),
    });

    const { reset } = formMethods;

    const handleClear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    /**
     * RENDER
     */

    const onValidationError = useCallback((errors: any) => {
        console.log('====================errors', errors);
    }, []);

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
                onValidationError={onValidationError}
            >
                <LineTypeSegmentForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LineTypeSegmentDialog;
