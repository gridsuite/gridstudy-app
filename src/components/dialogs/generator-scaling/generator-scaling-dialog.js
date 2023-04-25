/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import GeneratorScalingForm from './generator-scaling-form';
import { useCallback, useEffect } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { VARIATION_TYPE, VARIATIONS } from '../../utils/field-constants';
import { getVariationsSchema } from './variation/variation-utils';
import { generatorScaling } from '../../../utils/rest-api';
import { VARIATION_TYPES } from '../../network/constants';

const emptyFormData = {
    [VARIATION_TYPE]: VARIATION_TYPES.DELTA_P.id,
    [VARIATIONS]: [],
};

const formSchema = yup
    .object()
    .shape({
        [VARIATION_TYPE]: yup.string().required(),
        ...getVariationsSchema(VARIATIONS),
    })
    .required();

const GeneratorScalingDialog = ({
    editData,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            reset({
                [VARIATION_TYPE]: editData.variationType,
                [VARIATIONS]: editData.variations,
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (generatorScalingInfos) => {
            generatorScaling(
                studyUuid,
                currentNodeUuid,
                editData?.uuid ?? undefined,
                generatorScalingInfos[VARIATION_TYPE],
                generatorScalingInfos[VARIATIONS]
            ).catch((errorMessage) => {
                snackError({
                    messageTxt: errorMessage,
                    headerId: 'GeneratorScalingError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-generator-scaling"
                maxWidth={'md'}
                titleId="GeneratorScaling"
                {...dialogProps}
            >
                <GeneratorScalingForm />
            </ModificationDialog>
        </FormProvider>
    );
};

export default GeneratorScalingDialog;
